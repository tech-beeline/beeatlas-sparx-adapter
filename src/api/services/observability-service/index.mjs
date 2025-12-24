import { NotImplemented } from "../../../utils/errors.mjs";
import { MonitoringRepository } from "../../repositories/index.mjs";
import eaRepository from "../../repositories/sparx-ea-repository/ea-repository.mjs";
import { t_diagram, t_object } from "../../repositories/sparx-ea-repository/index.mjs";
import { GRAFANA_URL } from "../../resources/grafana/conts.mjs";
import { GrafanaService } from "../../resources/grafana/index.mjs";
import { ScenariosServiceInstance } from "../index.mjs";
import { DEFAULT_FOLDER_NAME, DEFAULT_FOLDER_UID } from "./const.mjs";
import ScenarioDashboard from "./scenarios/scenario-dashboard.mjs";
import { getScenarioDashboardTemplate } from "./scenarios/panels/template.mjs";
import { Scenario } from "../../model/scenario/index.mjs";
import { MetricSource, ScenarioSequenceDTO, SequenceCallDTO, SequenceCallMethodDTO } from "../../../client/src/model/sequence.mjs";
import { add_metric_info } from "./add-metric-info.mjs";

const grafanaService = new GrafanaService();
const monitoringRepository = new MonitoringRepository();

export class ObservabilityService {
    async buildApiMetricTemlate(uid, target) {
        try {
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

        } catch (error) {
            console.error(`Ошибка при создании шаблона получения метрик uid="${uid}", target=${JSON.stringify(target)}`, error)
        }
    }
    /**
     * 
     * @param {string} uid 
     * @returns {Promise}
     */
    async getScenarioDashboard(uid) {
        try {
            const d = await grafanaService.getDashboardByUID(uid.replaceAll(/[\{\}]/g, ""));
            return {
                status: "exist",
                updated: d.meta.updated,
                url: `${GRAFANA_URL}${d.meta.url}`,
                folder: d.meta.folderTitle
            };
        }
        catch (err) {
            return { status: "not found" };
        }
    }
    async publishScenarioDashboard(uid) {
        /**@type {[t_diagram, Scenario]} */
        const [scenario, sequence, mapic_source_url, method_sources, prev, template, _] = await Promise.all([
            eaRepository.first(t_diagram, { ea_guid: uid }),
            ScenariosServiceInstance.getScenarioSequence(uid),
            monitoringRepository.selectMapicMetricTemplate(),
            monitoringRepository.selectMethodsSources(),
            grafanaService.getDashboardByUID(uid),
            getScenarioDashboardTemplate(),
            grafanaService.prepareGrafanaFolder(DEFAULT_FOLDER_NAME, DEFAULT_FOLDER_UID)
        ]);

        if (!mapic_source_url) throw Error('Не найдена ссылка на настройку для метрик MAPIC');
        const mapic_template_uid = GrafanaService.dashboardUIDFromURL(mapic_source_url);
        if (!mapic_template_uid) throw Error(`Не корректный адрес для шаблона дашборда MAPIC`);

        const method_source_map = { MAPIC: { template: { uid: mapic_template_uid } } };

        for (const m of method_sources) {
            method_source_map[m.operation_guid] = m;
        }

        const sequence_sources = { MAPIC: method_source_map.MAPIC.template };

        for (const m of sequence.getAllMessages()) {
            if (!m.operation_guid) continue;
            if (m.stereotype === "via MAPIC") {
                m.metricSource = method_source_map.MAPIC;
                continue;
            }
            m.metricSource = method_source_map[m.operation_guid];
            if (m.metricSource && !m.metricSource.template) {
                if (!sequence_sources[m.metricSource.api_metric_template]) {
                    sequence_sources[m.metricSource.api_metric_template] = {
                        uid: GrafanaService.dashboardUIDFromURL(m.metricSource.api_metric_template)
                    }
                }
                m.metricSource.template = sequence_sources[m.metricSource.api_metric_template];
            }
        }
        await Promise.all(
            Object.values(sequence_sources)
                .map(s => this.buildApiMetricTemlate(s.uid, s)
                ));

        const dashboard = new ScenarioDashboard(uid, `Шаг ${scenario.name}`, prev, template);

        dashboard.addMessages(sequence.sequence);
        dashboard.layout();
        return grafanaService.postDashboard(dashboard);
    }

    /**
     * 
     * @param {ScenarioSequenceDTO} sequence 
     */
    async publishSequenceDashboard(sequence) {
        if (!sequence) throw Error("scenario == null");

        const [mapic_source_url, method_sources, prev, template, _] = await Promise.all([
            monitoringRepository.selectMapicMetricTemplate(),
            monitoringRepository.selectMethodsSources(),
            grafanaService.getDashboardByUID(sequence.code).catch(r => { }),
            getScenarioDashboardTemplate(),
            grafanaService.prepareGrafanaFolder(DEFAULT_FOLDER_NAME, DEFAULT_FOLDER_UID)
        ]);

        await add_metric_info(sequence, mapic_source_url, method_sources);

        const dashbaord = new ScenarioDashboard(
            sequence,
            prev,
            template);

        console.log('Дашборд сформирован, идет публикация в платформу наблюдаемости');
        return grafanaService.postDashboard(dashbaord);
    }
    async getDashboards() {
        NotImplemented();
    }

    async publishApplicationDashboard(code) {
        NotImplemented();
    }
}