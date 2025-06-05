import { NotImplemented } from "../../../utils/errors.mjs";
import { ProcessScenario, ScenarioMessage } from "../../model/index.mjs";
import { Scenario, ScenarioApplication, ScenarioApplicationDictionary, ScenarioDiagram, ScenarioDiagramDictionary, ScenarioDictionary, ScenarioIntrerface, ScenarioMethod } from "../../model/scenario/index.mjs";
import { ScenarioRepository } from "../../repositories/index.mjs";
import { buildCallTree } from "./build-call-tree.mjs";
import { onMessageDouble } from "./vlidate.mjs";

const scenariosRepository = new ScenarioRepository();

export class ScenariosService {
    async getAll() {
        NotImplemented();
    }
    async getByUID(scenarioUID) {
        const row = await scenariosRepository.selectScenario(scenarioUID);
        if (row) return new ProcessScenario(row);
    }
    async getScenarioMessages(scenarioUID) {
        const messagesRows = await scenariosRepository.selectScenarioMessages(scenarioUID);
        const messages = {};
        const diagrams = {};
        const get_diagram = (obj) => diagrams[obj.diagram_uid] || (diagrams[obj.diagram_uid] = new ScenarioDiagram(obj));
        for (const msg of messagesRows) {
            if (messages[msg.ea_guid]) {
                onMessageDouble(messages[msg.ea_guid], msg);
                continue;
            }
            msg.diagram = get_diagram(msg);
            messages[msg.ea_guid] = new ScenarioMessage(msg);
        }
        return Object.values(messages);
    }

    async getScenarioSequence(scenarioUID) {
        const messagesRows = await scenariosRepository.selectScenarioMessages(scenarioUID);
        const messages = {};
        const diagrams = new ScenarioDiagramDictionary();
        const interfaces = new ScenarioDictionary("api_id", ScenarioIntrerface);
        const methods = new ScenarioDictionary("operation_guid", ScenarioMethod);

        for (const msg of messagesRows) {
            if (messages[msg.ea_guid]) {
                onMessageDouble(messages[msg.ea_guid], msg);
                continue;
            }

            const m = messages[msg.ea_guid] = new ScenarioMessage(msg);
            /** @type {ScenarioDiagram} */
            (m.diagram = diagrams.update(msg)).addMessage(m);
            if (m.method = methods.update(msg)) {
                if (m.method.api = interfaces.update(msg)) {
                    m.method.api.methods.push(m.method);
                }
            }
            m.client = interfaces.update({ api_id: m.client_id });
            m.server = interfaces.update({ api_id: m.server_id });
        }

        const api_id_list = interfaces.toArray().map(i => i.id);
        const interfaces_rows = await scenariosRepository.selectScenarioInterfaces(api_id_list);
        const applications = new ScenarioApplicationDictionary();

        for (const row of interfaces_rows) {
            /**@type {ScenarioApplication}  */
            const app = applications.update(row);
            /** @type {ScenarioIntrerface} */
            [row.api_id, row.container_id, row.app_id].forEach(id => {
                interfaces.get(id)?.update(row, app)
            });
        }

        const sc = new Scenario(scenarioUID, Object.values(messages), diagrams.toArray(), interfaces.toArray(), applications.toArray());
        buildCallTree(sc);
        return sc;
    }
}