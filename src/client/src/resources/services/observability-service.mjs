import { ScenarioDTO, ScenarioMessage } from "../../model/scenario/index.mjs";
import { ScenarioSequenceDTO, SequenceCallApiDTO, SequenceCallDTO, SequenceCallMethodDTO } from "../../model/sequence.mjs";
import { SCENARIO_DASHBOARD_PUBLISH_RESOURCE, SEQUENCE_OBSERVABILITY_RESOURCE } from "../paths/index.mjs";
import { loadScenarioSequence } from "./scenario-service.mjs";

export const publishScenarioDashboard = async (scenarioUID) => {
    const response = await fetch(SCENARIO_DASHBOARD_PUBLISH_RESOURCE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            uid: scenarioUID
        })
    });

    if (response.status !== 200) throw Error(await response.text());
    return response.json();
};

/**
 * 
 * @param {ScenarioSequenceDTO} sequence 
 * @returns {Promise}
 */
export const postSequenceDashbhoard = async (sequence) => {
    const response = await fetch(SEQUENCE_OBSERVABILITY_RESOURCE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(sequence)
    });

    if (response.status !== 200) throw Error(await response.text());
    return response.json();
}

/**
 * 
 * @param {string} uid 
 * @param {ScenarioDTO} scenario 
 */
export const publishSequenceDashboard = async (uid, scenario) => {
    if (!scenario) scenario = await loadScenarioSequence(uid);

    const sequence = new ScenarioSequenceDTO();
    sequence.code = uid;
    sequence.name = scenario.name;
    /**
     * 
     * @param {ScenarioMessage} msg 
     */
    const getSequenceCall = (msg) => {
        /**@param {ScenarioMessage} msg */
        const create_call_dto = (msg) => {
            if (msg.server && msg.operation_guid) {
                for (const api of msg.server.interfaces) {
                    for (const m of api.methods) {
                        if (m.uid === msg.operation_guid) {
                            return new SequenceCallDTO(
                                new SequenceCallApiDTO(msg.server.code, undefined, api.code),
                                new SequenceCallMethodDTO(m.uid, m.name), m.stereotype);
                        }
                    }
                }
            }
            return new SequenceCallDTO(
                { app_code: msg.server_code, name: msg.server_name },
                new SequenceCallMethodDTO(msg.uid, msg.name));
        }

        const ret = create_call_dto(msg);
        ret.client_code = msg.client_code ?? msg.client_name;
        ret.context = msg.diagram;
        if (msg.sequence) {
            ret.sequence = msg.sequence.map(getSequenceCall);
        }
        return ret;
    }

    sequence.sequence = scenario.sequence.map(getSequenceCall);
    return postSequenceDashbhoard(sequence);
}