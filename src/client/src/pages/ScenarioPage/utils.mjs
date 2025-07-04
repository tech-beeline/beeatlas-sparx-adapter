import { ScenarioMessageDTO } from "../../model/scenario/scenario-message-dto.mjs";

/**@param {ScenarioMessageDTO} m  */
const msgKey = (m) => `${m.server_code || m.server_name}:${m.operation_guid || m.name}`;
/**
 * 
 * @param {ScenarioMessageDTO[]} lst
 * @returns {ScenarioMessageDTO[]} 
 */
export function distinctMessages(lst) {
    return Object.values(lst.reduce((acc, v) => acc[msgKey(v)] ? acc : (acc[msgKey(v)] = v, acc), {}))
}

export const slaString = (obj) => ["rps", "latency", "error_rate"].filter(k => obj[k]).map(k => `${k}=${obj[k]}`).join("; ")
