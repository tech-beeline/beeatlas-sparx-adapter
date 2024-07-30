import { NotFound, NotImplemented } from "../utils/errors.mjs";
import Repository from "../utils/ea-repo.mjs";
import t_object from "../utils/ea-model/t_object.mjs";
import t_operation from "../utils/ea-model/t_operation.mjs";
import componentsService from "./components-service.mjs";
import E2EProcessService from './e2e-process-service.mjs'
import { APIInterface, APIMethod, Container } from "../model/system.mjs";
import { query } from "express";
import { InterfaceCatalog } from "./interfaces-service.mjs";
import t_diagram from "../utils/ea-model/t_diagram.mjs";
import RestMethodRow from "./monitoring-templates/rest-api-row.mjs";
import LEGEND_PANEL from "./monitoring-templates/panels/legend.mjs";
import { API_STATE_HEADER_PANEL, SYSTEMS_HEALTH_HEADER_PANEL } from "./monitoring-templates/panels/headers.mjs";
import createInteractionStatPanel, { createGrafanaSource } from "./monitoring-templates/panels/method-stat.mjs";
import { ERROR_RATE_THRESHOLD_TAG, LATENCY_THRESHOLD_TAG, RPS_THRESHOLD_TAG } from "./sql/interfaces-queries.mjs";
import createInteractionPanels from "./monitoring-templates/panels/interaction-timeseries.mjs";
import { selectGrafanaSources } from "./sql/monitoring-source.mjs";
import { DEFAULT_OPENSEARCH_API_SOURCE, MAPIC_DEFAULT_API_SOURCE } from "./monitoring-templates/panels/source-options/opensearch.mjs";
import { getJSON, postJSON } from "../utils/http-request-promise.mjs";

const GRAFANA_URL = process.env.GRAFANA_URL ?? "https://inside-dev.beeline.ru"
const GRAFANA_TOKEN = process.env.GRAFANA_TOKEN;
const FOLDER_API_PATH = "/api/folders"
const DASHBOARD_API_PATH = "/api/dashboards/db"

const GRAFANA_HTTP_OPTIONS = { headers: { 'Authorization': `Bearer ${GRAFANA_TOKEN}` }, rejectUnauthorized: false };
const DEFAULT_FOLDER_UID = "archops";
const DEFAULT_FOLDER_NAME = "Architecture as a Code";
const SYSTEM_UID_PREFIX = 'archops-sys-'
const BI_UID_PREFIX = 'archops-bi-'

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
    promPercentileLatency(p) {
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
    async getGrafanaSources() {
        const raw = await selectGrafanaSources();
        let ret = {}
        for (let row of raw) {
            const source = ret[row.system_id] ?? (ret[row.system_id] = {})
            source[row.property] = row.value ?? row.notes
        }
        for (let id in ret) {
            const tv = ret[id];
            ret[id] = createGrafanaSource(tv);
        }
        return ret;
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
        const system = await componentsService.getSystem(code, { loadMethods: true, loadMethodTags: true });

        /** @type {APIMethod[]} */
        let methods = (system.containers ?? []).reduce((ret, container) => {
            return [...ret,
            ...container.interfaces?.reduce((c, i) => [...c, ...i.methods?.map(m => Object.assign({ container: container.name, interface: i.name }, m))], [])
            ]
        }, [])

        let methods_rows = methods.map(m => new RestMethodRow(...m.name.split(' ').slice(0, 2), {
            rps: m.taggedValues.find(i => i.property === RPS_THRESHOLD_TAG)?.value,
            latency: m.taggedValues.find(i => i.property === LATENCY_THRESHOLD_TAG)?.value,
            error_rate: m.taggedValues.find(i => i.property === ERROR_RATE_THRESHOLD_TAG)?.value
        })).map(p => p.build());

        let manifest = {
            title: `Дашборд API для ${system.name} [cmdb=${system.code}]`,
            tags: ["pilot", 'ke=FDMSHOWCASEAPP', 'api'],
            editable: true,
            rows: methods_rows
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
    }


    async buildInteractionsList(messages, map = { count: 0 }, grafana_sources) {
        grafana_sources = grafana_sources ?? await this.getGrafanaSources();
        let ret = [];
        for (let m of messages) {
            if (m.client && m.server) {
                const title = `${m.client.server.cmdb} - ${m.server.server.cmdb}${m.stereotype ? ` ${m.stereotype}` : ""}: ${m.message}`
                let interaction = map[title];
                if (!interaction) {
                    const [method, path] = m.message.split(' ').filter(it => it.length);
                    m.rps = Number(m.rps?.replace(',', '.'));
                    m.latency = Number(m.latency?.replace(',', '.'));
                    m.error_rate = Number(m.error_rate?.replace(',', '.'));
                    interaction = map[title] =
                    {
                        title: title, message: m.message, index: map.count++, count: 0, method: method, uri: path,
                        grafanaSource: m.stereotype === "via MAPIC" ? MAPIC_DEFAULT_API_SOURCE : grafana_sources[m.server.server.component_id] ?? DEFAULT_OPENSEARCH_API_SOURCE,
                        sla: {
                            rps: Number.isNaN(m.rps) ? 10 : m.rps,
                            latency: Number.isNaN(m.latency) ? 1 : m.latency,
                            errorRate: Number.isNaN(m.error_rate) ? 0.1 : m.error_rate
                        }
                    }
                    ret.push(interaction);
                }
                interaction.count++;
            }
            if (m.messages) ret.push(...await this.buildInteractionsList(m.messages, map, grafana_sources));
        }
        return ret;
    }

    async getScenarioJSON(code) {
        const process = await Repository.first(t_diagram, { ea_guid: code });
        if (!process) throw NotFound(`Процесс с GUID=${code} не найден`);
        const process_messages = await E2EProcessService.getProcessScenario(code, { isBIScenario: true });

        let interactions = await this.buildInteractionsList(process_messages.messages);

        let panels = [LEGEND_PANEL, SYSTEMS_HEALTH_HEADER_PANEL, API_STATE_HEADER_PANEL,
            ...interactions.map(it => createInteractionStatPanel(it)),
            ...interactions.reduce((r, v) => [...r, ...createInteractionPanels(v)], [])
        ];
        return panels;

    }
    async #prepareGrafanaFolder() {
        try {
            const folder = await getJSON(`${GRAFANA_URL}${FOLDER_API_PATH}/archops`, GRAFANA_HTTP_OPTIONS)
        } catch (err) {
            if (err.statusCode != 404)
                throw err;
            let resp = await postJSON(`${GRAFANA_URL}${FOLDER_API_PATH}`, GRAFANA_HTTP_OPTIONS, {
                uid: DEFAULT_FOLDER_UID,
                title: DEFAULT_FOLDER_NAME
            })
        }
    }
    /**
     * 
     * @param {string} code 
     * @returns 
     */
    async publishBIDashboard(code) {
        await this.#prepareGrafanaFolder();

        let body = {
            folderUid: DEFAULT_FOLDER_UID,
            overwrite: true,
            dashboard: {
                uid: code.replaceAll(/\{|\}/g, ''),
                title: `Дашборд для шага ${code}`,
                panels: await this.getScenarioJSON(code)
            }
        };

        return postJSON(`${GRAFANA_URL}${DASHBOARD_API_PATH}`, GRAFANA_HTTP_OPTIONS, body);
    }
    async publishSystemDashboard(cmdb) {
        await this.#prepareGrafanaFolder();


        const system = await componentsService.getSystem(cmdb, { loadMethods: true, loadMethodTags: true });
        const grafana_sources = await this.getGrafanaSources();


        /** @type {APIMethod[]} */
        let methods = (system.containers ?? []).reduce((ret, container) => {
            return [...ret,
            ...container.interfaces?.reduce((c, i) => [...c, ...i.methods?.map(m => Object.assign({ container: container.name, interface: i.name }, m))], [])
            ]
        }, []);

        let body = {
            folderUid: DEFAULT_FOLDER_UID,
            overwrite: true,
            dashboard: {
                uid: `${SYSTEM_UID_PREFIX}${cmdb}`,
                title: `Дашборд для ${cmdb}`,
            }
        };

        return postJSON(`${GRAFANA_URL}${DASHBOARD_API_PATH}`, GRAFANA_HTTP_OPTIONS, body);
    }
}

export default new MonitoringService();