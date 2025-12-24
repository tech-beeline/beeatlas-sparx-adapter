import { ScenarioDTO } from "../../model/scenario/index.mjs";
import { buildScenarioResourcePath } from "../services.mjs"

export const loadScenarioSequence = async (uid) => {
    const res = await fetch(buildScenarioResourcePath(uid));
    if (res.status !== 200) throw Error(await res.text());
    return ScenarioDTO.fromObject(await res.json());
}