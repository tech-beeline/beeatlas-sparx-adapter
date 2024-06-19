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
    get #openSearchQuery() {
        return `json.request_uri.keyword: /${this.ingressPath}/ AND json.request_method: "${this.method}"`;
    }
    get promTrafficQuery() {
        return `sum (increase(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}))`;
    }
    get promAvgLatency() {
        return `avg (http_server_requests_seconds_max{uri=\"${this.path}\", method=~"(?i:${this.method})"})`
    }
    get promMaxLatency() {
        return `max (http_server_requests_seconds_max{uri=\"${this.path}\", method=~"(?i:${this.method})"})`
    }
    get promPercentile95Latency(){
        return `quantile_over_time (0.95,

            avg ((sum by (uri) (
            rate(http_server_requests_seconds_sum{uri=\"${this.path}\", method=~"(?i:${this.method})"})))
            / 
            (sum by (uri) (
            rate(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}) > 0  ))) [$__rate_interval])`
    }
    get promPercentile75Latency(){
        return `quantile_over_time (0.75,

            avg ((sum by (uri) (
            rate(http_server_requests_seconds_sum{uri=\"${this.path}\", method=~"(?i:${this.method})"})))
            / 
            (sum by (uri) (
            rate(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}) > 0  ))) [$__rate_interval])`
    }
    get operSearchErrorRate(){
        return `quantile_over_time (0.75,

            avg ((sum by (uri) (
            rate(http_server_requests_seconds_sum{uri=\"${this.path}\", method=~"(?i:${this.method})"})))
            / 
            (sum by (uri) (
            rate(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}) > 0  ))) [$__rate_interval])`
    }

    get promTrafficAllStatus() {
        return `sum (increase(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"})) by (status)`;
    }
    get promErrorRate() {
        return `sum (increase(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})", status="200"}))
        /
        sum (increase(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}))
         by (status)`;
    }

    get trafficPanels() {

        return [
            {
                timeseries: {
                    title: `${this.method} ${this.path} Traffic, Ingress`,
                    datasource: "logstash-ingress-provider-ia-monitoring",
                    targets: [
                        {
                            opensearch: {
                                query: this.#openSearchQuery,
                                alias: 'Ingress'
                            }
                        }]
                }
            },
            {
                timeseries: {
                    title: `${this.method} ${this.path} Traffic, Prometheus`,
                    datasource: "Prometheus-BeeInside",
                    targets: [
                        {
                            prometheus: {
                                query: this.promTrafficQuery,
                                legend: "Traffic"
                            }
                        }]
                }
            }
        ]
    }
    get latencePanels() {
        return [
            {
                timeseries: {
                    title: `${this.method} ${this.path} Latency, Ingress`,
                    datasource: "logstash-ingress-provider-ia-monitoring",
                    targets: [
                        {
                            opensearch: {
                                query: this.#openSearchQuery,
                                alias: "Ingress",
                                metrics: [
                                    {
                                        field: "json.request_time",
                                        type: "percentiles",
                                        options:
                                        {
                                            values: [75, 95]
                                        }
                                    }
                                ]
                            }
                        },
                    ]
                }
            },
            {
                timeseries: {
                    title: `${this.method} ${this.path} Latency, Promethus`,
                    datasource: "Prometheus-BeeInside",
                    targets : [
                        {
                            prometheus: {
                                query: this.promAvgLatency,
                                legend: "Traffic, AVG"
                            }
                        },
                        {
                            prometheus: {
                                query: this.promMaxLatency,
                                legend: "Traffic, MAX"
                            }
                        },
                        {
                            prometheus: {
                                query: this.promPercentile75Latency,
                                legend: "Traffic, 75"
                            }
                        },
                        {
                            prometheus: {
                                query: this.promPercentile75Latency,
                                legend: "Traffic, 95"
                            }
                        }
                    ]
                }
            }
        ];
    }
    get errorRatePanel(){
        return [
            {
                timeseries: {
                    title: `${this.method} ${this.path} errorRate, Prometheus`,
                    datasource: "Prometheus-BeeInside",
                    targets : [
                        {
                            prometheus: {
                                query: this.promTrafficAllStatus,
                                legend: "All Status"
                            }
                        },
                        {
                            prometheus: {
                                query: this.promErrorRate,
                                legend: "error rate"
                            }
                        }
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
                /*
                {
                    timeseries: {
                        title: `${this.method} ${this.path} Latency, Ingress`,
                        datasource: "logstash-ingress-provider-ia-monitoring",
                        targets: [
                            {
                                opensearch: {
                                    datasource: "logstash-ingress-provider-ia-monitoring",
                                    query: `json.request_uri.keyword: /${this.ingressPath}/ AND json.request_method: "${this.method}"`,
                                    alias: "Ingress",
                                    metrics: [{
                                        field: "json.request_time",
                                        type: "percentiles",
                                        options:
                                            { values: [75, 95] }

                                    }]
                                }
                            },
                            {
                                opensearch: {
                                    datasource: "logstash-ingress-provider-ia-monitoring",
                                    query: `json.request_uri.keyword: /${this.ingressPath}/ AND json.request_method: "${this.method}"`,
                                    alias: "Ingress 75",
                                    metrics: [{
                                        field: "json.request_time",
                                        type: "percentiles",
                                        options:
                                            { values: [75] }

                                    }]
                                }
                            },
                            {
                                prometheus: {
                                    datasource: "Prometheus-BeeInside",
                                    query: `sum by (uri) (rate(http_server_requests_seconds_sum{uri="${this.path}", method=~"(?i:${this.method})"})  )
/ 
(sum by (uri) (rate(http_server_requests_seconds_count{uri="${this.path}", method=~"(?i:${this.method})"}) > 0 )[$__rate_interval])`,
                                    legend: "Application"
                                }
                            }
                        ]
                    }
                }*/
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