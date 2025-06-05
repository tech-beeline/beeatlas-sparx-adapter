import { NotImplemented } from '../../../utils/errors.mjs';
import Repository from '../sparx-ea-repository/index.mjs';
import { SELECT_ALL_E2E, SELECT_BI_DIAGRAMS_ID, SELECT_DIAGRAMS_MESSAGES, SELECT_DIAGRAMS_SYSTEMS, SELECT_E2E_BY_UID, SELECT_SCENARIO_MESSAGES } from './queries/index.mjs';
import { SELECT_ALL_SCENARIOS, SELECT_E2E_SCENARIOS } from './select-scenarios.mjs';



export class E2EProcessRepository {
	/**
	 * @returns {Promise<>}
	 */
	async selectAllE2E() {
		return Repository.queryRows(SELECT_ALL_E2E);
	}
	/**
	 * @returns {Promise<>}
	 */
	async selectE2EByUID(uid) {
		return Repository.queryOne(SELECT_E2E_BY_UID, [uid]);;
	}
	/**
	* @returns {Promise<>}
	*/
	async selectAllScenarios() {
		return Repository.queryRows(SELECT_ALL_SCENARIOS);;
	}
	/**
	* @returns {Promise<>}
	*/
	async selectE2EScenarios(uid) {
		return Repository.queryRows(SELECT_E2E_SCENARIOS, [uid]);
	}
	/**
	* @returns {Promise<>}
	*/
	async selectBIMessages(uid) {
		return Repository.query( SELECT_SCENARIO_MESSAGES, uid);
	}
	/**
	* @returns {Promise<>}
	*/
	async selectDiagramsSystems(diagramIds) {
		return Repository.queryRows(SELECT_DIAGRAMS_SYSTEMS, [diagramIds.map(d => d.diagram_id)])
	}
	async selectBIDiagrams(uid) {
		NotImplemented();
	}
}
