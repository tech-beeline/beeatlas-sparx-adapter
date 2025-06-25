import { NotImplemented } from "../../../utils/errors.mjs";
import { GRAFANA_URL } from "../../resources/grafana/conts.mjs";
import { GrafanaService } from "../../resources/grafana/index.mjs";
import { E2EProcessesServiceInstance } from "../index.mjs";

const grafanaService = new GrafanaService();

export class ObservabilityService {
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

        //const scenario = await E2EProcessesServiceInstance.getBIScenario(uid);

        NotImplemented();
    }
    async getDashboards() {

    }

    async publishApplicationDashboard(code) {
        NotImplemented();
    }
}