import { ScenarioApplicationDTO, ScenarioInterfaceDTO } from "./scenario-application-dto.mjs";
import { ScenarioMessage } from "./scenario-message-dto.mjs";
export { ScenarioMessageDTO, ScenarioMessage } from "./scenario-message-dto.mjs"
export { ScenarioInterfaceDTO } from "./scenario-application-dto.mjs"


export class ScenarioDTO {
    /**@type {Array<ScenarioMessageDTO>} */
    sequence;
    /**@type {Array<ScenarioApplicationDTO>} */
    applications;
    /**@type {} */
    interfaces;
    constructor(obj) {
        Object.assign(this, obj);
    }
    static fromObject(obj) {
        const scenario = new ScenarioDTO(obj)

        scenario.applications = scenario.applications ? scenario.applications.map(r => new ScenarioApplicationDTO(r)) : [];
        const app_map = scenario.applications.reduce((r, v) => ((r[v.code] = v), r), {});
        scenario.interfaces = scenario.interfaces
            ? scenario.interfaces.map(i => new ScenarioInterfaceDTO(i, app_map[i.app_code]))
            : [];

        scenario.applications = scenario.applications.filter(app => app.interfaces && app.interfaces.length);

        if (scenario.sequence)
            scenario.sequence = scenario.sequence.map(m => new ScenarioMessage(m, app_map));
        return scenario;
    }
}