import { DEFAULT_FOLDER_UID } from "../../../legacy/services/monitoring-templates/const.mjs";
import { NotImplemented } from "../../../utils/errors.mjs";
import { getJSON, postJSON } from "../../../utils/http-request-promise.mjs";
import { DASHBOARD_API_PATH, DASHBOARD_UID_REGEXP, GET_DASHBOARD_BY_UID_PATH, GET_DASHBOARDS_PATH, GET_DATASOURCE_BY_NAME_PATH, GRAFANA_E2E_TEMPLATE_UID, GRAFANA_HTTP_OPTIONS, GRAFANA_URL } from "./conts.mjs";

export class GrafanaService {
    datasourceMap = {};
    async getDashboardByUID(dashboardUID) {
        return getJSON(`${GRAFANA_URL}${GET_DASHBOARD_BY_UID_PATH}${dashboardUID}`, GRAFANA_HTTP_OPTIONS);
    }
    async getScenarioTemplate() {
        return this.getDashboardByUID(GRAFANA_E2E_TEMPLATE_UID);
    }

    async getDashboards() {
        return getJSON(`${GRAFANA_URL}${GET_DASHBOARDS_PATH}$`, GRAFANA_HTTP_OPTIONS);
    }

    async postDashboard(dashboard, folderUid = DEFAULT_FOLDER_UID, override = true, message) {
        const body = {
            folderUid: folderUid,
            overwrite: override,
            message: message,
            dashboard: dashboard
        };
        return postJSON(`${GRAFANA_URL}${DASHBOARD_API_PATH}`, GRAFANA_HTTP_OPTIONS, body);
    }
    async getDatasourceByName(name) {
        return this.datasourceMap[name]??getJSON(`${GRAFANA_URL}${GET_DATASOURCE_BY_NAME_PATH}${name}`, GRAFANA_HTTP_OPTIONS);
    }
    /**
     * 
     * @param {string} url 
     */
    static dashboardUIDFromURL(url) {
        if (!url) return null;
        const r = url.match(DASHBOARD_UID_REGEXP);
        if (r.length > 1) return r[1];
        return null;
    }
    static getVariableCurrentValue(dashboard, name) {
        return dashboard.templating?.list.find( t=>t.name==name)?.current.value;
    }
}