import { NotImplemented } from "../../../utils/errors.mjs";
import { ProcessScenario, ScenarioMessage } from "../../model/index.mjs";
import { ScenarioRepository } from "../../repositories/index.mjs";

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
        return messagesRows.map(row => new ScenarioMessage(row));
        NotImplemented();
    }

    async getScnearioSystems() {
        NotImplemented();
    }
    async getScnearioInterfaces() {
        NotImplemented();
    }
    async getScnearioTC() {
        NotImplemented();
    }
}