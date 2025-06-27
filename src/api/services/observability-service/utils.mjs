import { ScenarioMessage } from "../../model/index.mjs";

/**
 * 
 * @param {ScenarioMessage} msg 
 * @returns 
 */
export const messageTitle = (msg) => `${msg.client?.app_code ?? msg.client_name}->${msg.server?.app_code??msg.server_name}${msg.stereotype?" " + msg.stereotype:""}:${msg.method?.name??msg.name}`;