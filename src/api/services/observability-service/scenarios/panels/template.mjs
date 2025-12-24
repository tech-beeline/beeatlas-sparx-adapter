import {
    GRAFANA_INTERACTION_TEMPLATE_ROW,
    GRAFANA_MESSAGES_HEADERS_ROW,
    GRAFANA_MESSAGES_TEMPLATE_ROW
} from "../../../../const.mjs";
import { GrafanaService } from "../../../../resources/index.mjs";
import { GrafanaPanel } from "../../dashboard/panels/index.mjs";
import {
    LegendPanel,
    ScenarioStatPanel,
    ScenarioDetailsRow
} from "./index.mjs";

const grafanaService = new GrafanaService();


export class ScenarioDashboardTemplate {
    /**@type {LegendPanel} */
    legendPanel;
    /**@type {ScenarioStatPanel} */
    statTemplate;
    /**@type {GrafanaPanel} */
    messageHeaderTemplate;
    messageTemplate;
    /**@type {ScenarioDetailsRow} */
    interactionPanelTemplate;
}
/**
 * 
 * @returns {Promise<ScenarioDashboardTemplate>}
 */
export async function getScenarioDashboardTemplate() {

    const dashboardTemplate = await grafanaService.getScenarioTemplate();

    /**
     * @type {Array}
     */
    const templatePanels = dashboardTemplate.dashboard.panels;
    const legendPanel = templatePanels.find(p => p.id == 101);
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
        legendPanel: legendPanel,
        statTemplate: statTemplate,
        messageHeaderTemplate: messageHeaderTemplate,
        messageTemplate: messageTemplate,
        interactionPanelTemplate: interactionPanelTemplate
    }
}
