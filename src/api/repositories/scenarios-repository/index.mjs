import { SELECT_RELATED_DIAGRAM } from "./select-related-diagrams.mjs";
import Repository from '../sparx-ea-repository/index.mjs';
import { SELECT_SCENARIO_BY_UID } from "./select-scenario.mjs";
import { NotImplemented } from "../../../utils/errors.mjs";
import { SELECT_MESSAGES_BY_DIAGRAM_ID_LIST } from "./diagram-messages-queries.mjs";

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
     * @returns {Promise<Array<>>}
     */
    async selectScenarioMessages(scenarioUID) {
        const messagesRows = await Repository.query(SELECT_SCENARIO_SEQUENCE_MESSAGES, scenarioUID);
    }
}