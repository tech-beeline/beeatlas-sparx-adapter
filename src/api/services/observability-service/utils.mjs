import { ScenarioMessage } from "../../model/index.mjs";

/**
 * 
 * @param {ScenarioMessage} msg 
 * @returns 
 */
export const messageTitle = (msg) =>
    `${msg.client_code ?? msg.client_name??""}->${msg.server_code ?? msg.api?.app_code ?? msg.api?.name ?? msg.server_name}${msg.stereotype ? " " + msg.stereotype : ""}:${msg.method?.name ?? msg.name}`;