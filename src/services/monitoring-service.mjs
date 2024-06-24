import { NotFound, NotImplemented } from "../utils/errors.mjs";
import Repository from "../utils/ea-repo.mjs";
import t_object from "../utils/ea-model/t_object.mjs";
import t_operation from "../utils/ea-model/t_operation.mjs";
import componentsService from "./components-service.mjs";
import E2EProcessService from './e2e-process-serivce.mjs'
import { APIInterface, Container } from "../model/system.mjs";
import { query } from "express";
import { InterfaceCatalog } from "./interfaces-service.mjs";
import t_diagram from "../utils/ea-model/t_diagram.mjs";


class InvalidMessageMetrics {
    msg;
    description;
    constructor(msg, description) {
        this.msg = msg;
        this.description = description;
    }
    toRow() {
        return {
            name: this.name,
            panels: [
                {
                    text: {
                        title: 'Ошибка при получении информации по сообщению',
                        markdown: this.description
                    }
                }
            ]
        }
    }
}

class RESTMethodMetrics {
    path;
    method;
    host;
    sla;
    constructor(path, method, host, sla) {
        this.host = host;
        this.path = path;
        this.method = method;
        this.sla = sla;
    }
    static openSearchTarget(query, alias, metrics) {
        return {
            opensearch: {
                datasource: "logstash-ingress-provider-ia-monitoring",
                query: query,
                alias: alias,
                metrics: Array.isArray(metrics) ? metrics : metrics ? [metrics] : undefined
            }
        }
    }
    static prometheusTarget(query, legend) {
        return {
            prometheus: {
                datasource: "Prometheus-BeeInside",
                query: query,
                legend: legend
            }
        }
    }
    get #openSearchQuery() {
        return `json.request_uri.keyword: /${this.ingressPath}/ AND json.request_method: "${this.method}"`;
    }
    get #promTrafficQuery() {
        return `sum (increase(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}))`;
    }
    get #promAvgLatency() {
        return `avg((sum(rate(http_server_requests_seconds_sum{uri=\"${this.path}\", method=~"(?i:${this.method})"}))
        / sum(rate(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}) > 0  )))`
    }
    get #promMaxLatency() {
        return `max (http_server_requests_seconds_max{uri=\"${this.path}\", method=~"(?i:${this.method})"})`
    }
    promPercentileLatency( p ){
        return `quantile_over_time (${p}, avg((sum(rate(http_server_requests_seconds_sum{uri=\"${this.path}\", method=~"(?i:${this.method})"}))
/ sum(rate(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}) > 0  ))) [$__rate_interval])`
    }
    get #promP95Latency() {
        return this.promPercentileLatency(0.95);
    }
    get #promP75Latency() {
        return this.promPercentileLatency(0.75);
    }

    get #promErrorRate() {
        return `sum (increase(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})", status="200"}))
        / sum (increase(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}))`;
    }

    get trafficPanels() {

        return [
            {
                timeseries: {
                    title: `${this.method} ${this.path} Traffic`,
                    datasource: "-- Mixed --",
                    targets: [
                        RESTMethodMetrics.openSearchTarget(this.#openSearchQuery, "Ingress Traffic"),
                        RESTMethodMetrics.prometheusTarget(this.#promTrafficQuery, "Prometheus Traffic")
                    ]
                }
            }
        ]
    }
    get latencePanels() {
        return [
            {
                timeseries: {
                    title: `${this.method} ${this.path} Latency`,
                    datasource: "-- Mixed --",
                    targets: [
                        RESTMethodMetrics.openSearchTarget(this.#openSearchQuery, "Ingress max", { field: "json.request_time", type: "max" }),
                        RESTMethodMetrics.openSearchTarget(this.#openSearchQuery, "Ingress average", { field: "json.request_time", type: "average" }),
                        RESTMethodMetrics.openSearchTarget(this.#openSearchQuery, "Ingress P75", { field: "json.request_time", type: "percentiles", options: { values: [75] } }),
                        RESTMethodMetrics.openSearchTarget(this.#openSearchQuery, "Ingress P95", { field: "json.request_time", type: "percentiles", options: { values: [95] } }),
                        RESTMethodMetrics.prometheusTarget(this.#promMaxLatency, "Prometheus max"),
                        RESTMethodMetrics.prometheusTarget(this.#promAvgLatency, "Prometheus average"),
                        RESTMethodMetrics.prometheusTarget(this.#promP75Latency, "Prometheus P75"),
                        RESTMethodMetrics.prometheusTarget(this.#promP95Latency, "Prometheus P95")
                    ]
                }
            }
        ];
    }
    get errorRatePanel() {
        return [
            {
                timeseries: {
                    title: `${this.method} ${this.path} error rate`,
                    datasource: "Prometheus-BeeInside",
                    targets: [
                        RESTMethodMetrics.prometheusTarget(this.#promErrorRate, "Prometheus error rate")
                    ]
                }
            }
        ];
    }
    toRow() {
        return {
            name: `${this.method} ${this.path}`,
            panels: [
                ...this.trafficPanels,
                ...this.latencePanels,
                ...this.errorRatePanel
            ]
        }

    }
    get ingressPath() {
        return this.path?.split('/')
            .map(a => a.startsWith('{') && a.endsWith('}') ? `(.*)` : a)
            .join('\\/');
    }
}
class MonitoringService {
    prepareInressPathRegex(path) {
        return path?.split('/')
            .map(a => a.startsWith('{') && a.endsWith('}') ? `(.*)` : a)
            .join('\\/');
    }
    /**
     * 
     * @param {APIInterface} i 
     * @returns 
     */
    buildInterfacesPanels(i) {
        return i.methods.map(m => m.name.split(' ').filter(s => s.length))
            .map(([m, p]) => new RESTMethodMetrics(p, m))
            .reduce((ret, m) => [...ret, m.toRow()], []);
    }
    /**
     * 
     * @param {Container} container 
     */
    buildContainerRows(container) {
        return container.interfaces?.reduce((ret, i) => [...ret, ...this.buildInterfacesPanels(i)], []) ?? [];
    }
    async getSystemApiManifest(code) {
        const system = await componentsService.getSystem(code, { loadMethods: true });
        let manifest = {
            title: `Дашборд API для ${system.name} [cmdb=${system.code}]`,
            tags: ["pilot", 'ke=FDMSHOWCASEAPP', 'api'],
            editable: true,
            rows: (system.containers ?? []).reduce((ret, contianer) => {
                return [...ret, ...this.buildContainerRows(contianer)]
            }, [])
        };
        return manifest;
    }
    async getInterfaceDashboardManifest(code) {
        NotImplemented();
    }

    async getProcessDashboardManifest(uid) {
        const process = await Repository.first(t_diagram, { ea_guid: uid });
        if (!process) throw NotFound(`Процесс с GUID=${uid} не найден`);

        const process_messages = await E2EProcessService.getProcessMessages(uid);
        let interface_catalog = new InterfaceCatalog();
        let api_list = {}
        for (let ea_m of process_messages.filter(m => m.operation_guid)) {
            if (api_list[ea_m.operation_guid])
                continue;

            let i = await interface_catalog.byOperationGUID(ea_m.operation_guid);
            let m = i?.methodByUID(ea_m.operation_guid);
            if (m) {
                let [method, path] = m.name.split(' ').filter(s => s.length);
                api_list[ea_m.operation_guid] = new RESTMethodMetrics(path, method);
                continue;
            }
            api_list[ea_m.operation_guid] = new InvalidMessageMetrics(ea_m.name, `Не получилось получить информацию о методу в сообщении`)
        }

        let manifest = {
            title: `Дашборд для E2E процесса ${process.name}`,
            tags: ["pilot", 'ke=FDMSHOWCASEAPP', 'process'],
            editable: true,
            rows: Object.values(api_list).map(m => m.toRow())
        };
        return manifest;

        NotImplemented();
    }
}

export default new MonitoringService();