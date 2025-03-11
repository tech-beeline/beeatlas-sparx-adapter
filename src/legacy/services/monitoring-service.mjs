import { NotFound, NotImplemented } from "../../utils/errors.mjs";

import Repository, {
    t_diagram
} from '../../api/repositories/sparx-ea-repository/index.mjs';

import componentsService from "./components-service.mjs";
import E2EProcessService from './e2e-process-service.mjs'
import { APIInterface, APIMethod, Container } from "../../api/model/system.mjs";
import { query } from "express";
import { InterfaceCatalog } from "./interfaces-service.mjs";
import RestMethodRow from "./monitoring-templates/rest-api-row.mjs";
import LEGEND_PANEL from "./monitoring-templates/panels/legend.mjs";
import { API_STATE_HEADER_PANEL, SYSTEMS_HEALTH_HEADER_PANEL } from "./monitoring-templates/panels/headers.mjs";
import createInteractionStatPanel, { createGrafanaSource } from "./monitoring-templates/panels/method-stat.mjs";
import { ERROR_RATE_THRESHOLD_TAG, LATENCY_THRESHOLD_TAG, RPS_THRESHOLD_TAG } from "./sql/interfaces-queries.mjs";
import createInteractionPanels from "../../api/services/observability-service/dashboard/panels/interaction-row/interaction-timeseries.mjs";
import { selectGrafanaSources } from "./sql/monitoring-source.mjs";
import { DEFAULT_OPENSEARCH_API_SOURCE, MAPIC_DEFAULT_API_SOURCE } from "../../api/services/observability-service/dashboard/sources/opensearch.mjs";
import { getJSON, postJSON } from "../../utils/http-request-promise.mjs";
import callTreePanel from "./monitoring-templates/panels/call-tree.mjs";
import { DEFAULT_FOLDER_NAME, DEFAULT_FOLDER_UID } from "./monitoring-templates/const.mjs";
import SystemDashboard from "./monitoring-templates/system-dashboard.mjs";
import Sequence from "./monitoring-templates/sequence.mjs";
import { ScenarioDashboard } from "../../api/services/observability-service/dashboard/scenario-dashboard.mjs";
import { MonitoringRepository } from "../../api/repositories/index.mjs";
import { SourceFactory } from "../../api/services/observability-service/dashboard/sources/index.mjs";
import { GRAFANA_INTERACTION_TEMPLATE_ROW, GRAFANA_MESSAGES_HEADERS_ROW, GRAFANA_MESSAGES_TEMPLATE_ROW } from "../../api/const.mjs";
import { SecnarioDashboardBuilder } from "../../api/services/observability-service/dashboard/scenario-dashboard-builder.mjs";
import { GrafanaService } from "../../api/resources/index.mjs";
import { DASHBOARD_API_PATH, FOLDER_API_PATH, GET_DASHBOARD_BY_UID_PATH, GRAFANA_E2E_TEMPLATE_UID, GRAFANA_HTTP_OPTIONS, GRAFANA_URL } from "../../api/resources/grafana/conts.mjs";

const monitoringRepository = new MonitoringRepository();
const grafanaService = new GrafanaService();

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

    async getGrafanaSourceMap() {
        const raw = await selectGrafanaSources();
        let ret = {}
        for (let row of raw) {
            const source = ret[row.code] ?? (ret[row.code] = {})
            source[row.property] = row.value ?? row.notes
        }
        for (let id in ret) {
            const tv = ret[id];
            ret[id] = createGrafanaSource(tv);
        }
        return ret;
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

    async getInteractions(messages, map = { count: 0 }, grafana_sources) {
        grafana_sources = grafana_sources ?? await this.getGrafanaSourceMap();
        let ret = [];
        for (let m of messages) {
            if (m.client_code && m.server_code) {
                const title = `${m.client_code} - ${m.server_code}${m.stereotype ? ` ${m.stereotype}` : ""}: ${m.name}`
                m.interaction = map[title];
                if (!m.interaction) {
                    const [method, path] = (m.method?.name ?? m.name).split(' ').filter(it => it.length);
                    m.rps = Number(m.rps?.replace(',', '.'));
                    m.latency = Number(m.latency?.replace(',', '.'));
                    m.error_rate = Number(m.error_rate?.replace(',', '.'));
                    m.interaction = map[title] =
                    {
                        title: title, message: m.message, index: map.count++, count: 0, method: method, uri: path,
                        grafanaSource: m.stereotype === "via MAPIC" ? MAPIC_DEFAULT_API_SOURCE : grafana_sources[m.server_code] ?? DEFAULT_OPENSEARCH_API_SOURCE,
                        sla: {
                            rps: Number.isNaN(m.rps) ? 10 : m.rps,
                            latency: Number.isNaN(m.latency) ? 1 : m.latency,
                            errorRate: Number.isNaN(m.error_rate) ? 0.1 : m.error_rate
                        },
                        protocol: m.method?.protocol
                    }
                    ret.push(m.interaction);
                }
                m.interaction.count++;
            }
            if (m.children) ret.push(...await this.getInteractions(m.children, map, grafana_sources));
        }
        return ret;
    }

    async getScenarioJSON(code, process) {

        const scenario = await E2EProcessService.getBIScenario(code);
        const sources = new SourceFactory();
        const methodsSources = await monitoringRepository.selectMethodsSources().then(rows => rows.reduce((acc, v) =>
            (acc[v.operation_guid] = sources.getSource(v), acc), {}));

        const dashboard = new ScenarioDashboard(scenario, methodsSources);
        const ret = dashboard.getPanels();
        return ret;
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
     * @returns {Promise<{statTemplate,messageHeaderTemplate, messageTemplate, interactionPanelTemplate}>}
     */
    async getE2EScenarioTemplate() {

        const dashboardTemplate = await grafanaService.getScenarioTemplate();

        /**
         * @type {Array}
         */
        const templatePanels = dashboardTemplate.dashboard.panels;
        const sourceTemplate = templatePanels.find(p => p.id == 1);
        const transformationsTemplate = templatePanels.find(p => p.id == 2);

        const statTemplate = { ...{}, ...transformationsTemplate, targets: sourceTemplate.targets, datasource: sourceTemplate.datasource };

        const msgHeaderRowIndex = templatePanels.findIndex(p => p.title == GRAFANA_MESSAGES_HEADERS_ROW);
        if (msgHeaderRowIndex === -1) {
            throw Error(`В шаблоне дашборда Е2Е сценария не найден шаблон для шапки сообщений (${GRAFANA_MESSAGES_HEADERS_ROW})`);
        }

        const msgTemlateRowIndex = templatePanels.findIndex(p => p.title == GRAFANA_MESSAGES_TEMPLATE_ROW);

        if (msgTemlateRowIndex === -1) {
            throw Error(`В шаблоне дашборда Е2Е сценария не найден шаблон для сообщений (${GRAFANA_MESSAGES_TEMPLATE_ROW})`);
        }

        const interactionTemlateRowIndex = templatePanels.findIndex(p => p.title == GRAFANA_INTERACTION_TEMPLATE_ROW);

        if (interactionTemlateRowIndex === -1) {
            throw Error(`В шаблоне дашборда Е2Е сценария не найден шаблон взаимодейства (${GRAFANA_INTERACTION_TEMPLATE_ROW})`);
        }
        const messageHeaderTemplate = [...templatePanels[msgHeaderRowIndex].panels, ...templatePanels.slice(msgHeaderRowIndex + 1, msgTemlateRowIndex)]
        const messageTemplate = [...templatePanels[msgTemlateRowIndex].panels, ...templatePanels.slice(msgTemlateRowIndex + 1, interactionTemlateRowIndex)]
        const interactionPanelTemplate = [...templatePanels[interactionTemlateRowIndex].panels, ...templatePanels.slice(interactionTemlateRowIndex + 1)]
        return {
            statTemplate: statTemplate,
            messageHeaderTemplate: messageHeaderTemplate,
            messageTemplate: messageTemplate,
            interactionPanelTemplate: interactionPanelTemplate
        }
    }


    async buildApiMetricTemlate(uid, target) {
        const dashboard = await grafanaService.getDashboardByUID(uid);
        const selectedDatasourceName = GrafanaService.getVariableCurrentValue(dashboard.dashboard, 'DATASOURCE');
        const datasource = await grafanaService.getDatasourceByName(selectedDatasourceName);

        for (const panel of dashboard.dashboard.panels) {
            panel.datasource.uid = datasource.uid;
            for (const target of panel.targets) {
                if (target.datasource.uid === '${DATASOURCE}' || target.datasource.uid === '$DATASOURCE') {
                    target.datasource.uid = datasource.uid;
                }
            }
        }

        return Object.assign(target, dashboard.dashboard);
    }

    /**
     * 
     * @param {string} code 
     * @returns 
     */
    async publishBIDashboard(code) {

        const process = await Repository.first(t_diagram, { ea_guid: code });
        if (!process) throw NotFound(`Процесс с GUID=${code} не найден`);

        const template = await this.getE2EScenarioTemplate();

        const scenario = await E2EProcessService.getBIScenario(code);
        const sources = new SourceFactory();
        const methodsSourcesRows = await monitoringRepository.selectMethodsSources();

        const apiMetricTemplates = {};
        const methodSourcesMap = {};
        for (const m of methodsSourcesRows) {
            if (!m.api_metric_template)
                continue;

            const template_uid = GrafanaService.dashboardUIDFromURL(m.api_metric_template);
            m.apiMetricTemplate = apiMetricTemplates[template_uid] ?? (apiMetricTemplates[template_uid] = {});
            methodSourcesMap[m.operation_guid] = m;
        }

        await Promise.all(
            Object.entries(apiMetricTemplates)
                .map(([uid, value]) => this.buildApiMetricTemlate(uid, value)
                ));


        const builder = new SecnarioDashboardBuilder(template);
        const dashboardPanels = builder.buildScenarioDashboard(scenario, methodSourcesMap);

        await this.#prepareGrafanaFolder();

        return grafanaService.postDashboard({
            uid: code.replaceAll(/\{|\}/g, ''),
            title: `Дашборд для шага ${process.name}`,
            panels: dashboardPanels
        });
    }

    async publishSystemDashboard(cmdb) {
        await this.#prepareGrafanaFolder();

        const system = await componentsService.getSystem(cmdb);
        const sources = new SourceFactory();

        //const sourceMap = this.selectSourcesMap();
        const methodsSources = await monitoringRepository.selectSystemMethodsSources(cmdb);

        const apiMap = {};
        for (const method of methodsSources) {
            const api = apiMap[method.api_guid] ?? (apiMap[method.api_guid] = { name: method.name, code: method.code, methods: [] });
            if (method.source)
                method.source = sources.getSource(method);
            api.methods.push(method);
        }

        const dashboard = SystemDashboard(system, Object.values(apiMap));
        console.log(dashboard);

        return postJSON(`${GRAFANA_URL}${DASHBOARD_API_PATH}`, GRAFANA_HTTP_OPTIONS, dashboard);
    }
}

export default new MonitoringService();