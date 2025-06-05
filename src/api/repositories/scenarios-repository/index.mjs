import { SELECT_RELATED_DIAGRAM } from "./select-related-diagrams.mjs";
import Repository from '../sparx-ea-repository/index.mjs';
import { SELECT_SCENARIO_BY_UID } from "./select-scenario.mjs";
import { NotImplemented } from "../../../utils/errors.mjs";
import { SELECT_SCENARIO_INTERFACES, SELECT_SCENARIO_MESSAGES } from "./queries/index.mjs";
import { MethodDTO } from "./message-dto.mjs";

export class ScenarioRepository {
    /**
     * 
     * @param {string} scenarioUID 
     * @returns {Promise<Array<{name, diagram_id, parent_id, ea_guid, diagram_uid, author, version, notes}>>}
     */
    async selectRelatedDiagrams(scenarioUID) {
        return Repository.queryRows(SELECT_RELATED_DIAGRAM, [scenarioUID]);
    }
    /**
     * 
     * @param {string} scenarioUID Идентификатор сценария
     * @returns {Promise<{ name, version, uid, author, description}>}
     */
    async selectScenario(scenarioUID) {
        return Repository.queryOne(SELECT_SCENARIO_BY_UID, [scenarioUID]);
    }
    /**
     * 
     * @param {string} scenarioUID 
     * @returns {Promise<Array<{name, ea_guid}>>}
     */
    async selectScenarioMessages(scenarioUID) {
        return Repository.query(SELECT_SCENARIO_MESSAGES, scenarioUID);
    }

     /**
     * 
     * @param {Array} api_id_list 
     * @returns {Promise<Array<MethodDTO>>}
     */
     async selectScenarioInterfaces(api_id_list) {
        return Repository.query(SELECT_SCENARIO_INTERFACES, api_id_list);
    }
}