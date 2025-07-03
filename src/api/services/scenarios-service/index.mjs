import { BadRequest, NotFound, NotImplemented } from "../../../utils/errors.mjs";
import { ProcessScenario, ScenarioMessage } from "../../model/index.mjs";
import {
    Scenario,
    ScenarioApplication,
    ScenarioApplicationDictionary,
    ScenarioDiagram,
    ScenarioDiagramDictionary,
    ScenarioDictionary,
    ScenarioInterface,
    ScenarioMethod
} from "../../model/scenario/index.mjs";
import { InterfacesRepository, ScenarioRepository } from "../../repositories/index.mjs";
import eaRepository from "../../repositories/sparx-ea-repository/ea-repository.mjs";
import { t_diagram } from "../../repositories/sparx-ea-repository/index.mjs";
import { buildCallTree } from "./build-call-tree.mjs";
import { onMessageDouble } from "./vlidate.mjs";

const scenariosRepository = new ScenarioRepository();
const interfaceRepository = new InterfacesRepository();

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

    async getScenarioSequence(scenarioUID, removeInfo = true, removeError = true) {
        if (!scenarioUID) throw BadRequest(`scenarioUID не указан`);
        const [messagesRows, scenario_diagram] = await Promise.all([
            scenariosRepository.selectScenarioMessages(scenarioUID),
            eaRepository.first(t_diagram, { ea_guid: scenarioUID })
        ]);
        if (!scenario_diagram) throw NotFound(`Сценарий с uid=${scenarioUID} не найден`);
        const messages = {};
        const diagrams = new ScenarioDiagramDictionary();
        const interfaces = new ScenarioDictionary("server_id", ScenarioInterface);
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
                if ((!m.method.api) && (m.method.api = interfaces.update(msg))) {
                    m.method.api.methods.push(m.method);
                }
            }
            m.server = interfaces.update({ server_id: m.server_id, api_id: m.server_id, api_name: msg.server_name });
            m.client = interfaces.update({ server_id: m.client_id, api_id: m.client_id, api_name: msg.client_name });
        }

        const api_id_list = interfaces.toArray().map(i => i.id);
        const interfaces_rows = await scenariosRepository.selectScenarioInterfaces(api_id_list);
        const applications = new ScenarioApplicationDictionary();

        for (const row of interfaces_rows) {
            /** @type {ScenarioInterface} */
            [row.api_id, row.container_id, row.app_id].forEach(id => {
                /**@type {ScenarioInterface} */
                const it = interfaces.get(id);
                if (it) {
                    it.update(row, applications.update(row));
                };
            });
        }

        const methods_mapping = await interfaceRepository.selectMethodMappingByUID(methods.toArray().map(m => m.uid));
        for (const row of methods_mapping) {
            /**@type {ScenarioMethod} */
            const m = methods.get(row.method_uid);
            if (!m) {
                console.warn(`Не найден метод ${row.method_name} uid=${row.method_uid} при постройке дерева вызовов для сценария uid=${scenarioUID}`);
                continue;
            }
            m.addStructurizrMap(row);
        }

        const sc = new Scenario(scenarioUID, scenario_diagram?.name, Object.values(messages), diagrams, interfaces, applications);
        buildCallTree(sc, removeInfo, removeError);
        return sc;
    }
}