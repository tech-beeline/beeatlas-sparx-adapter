import { ScenarioMessage } from "../../model/index.mjs";


/**
 * 
 * @param {ScenarioMessage} msg 
 * @param {*} dbl 
 */
export function onMessageDouble(msg, dbl) {
    msg.addValidationError(`Найден дубль для сообщения с uid=${msg.uid} с sla:rps=${dbl.rps || ""};latency=${dbl.latency || ""};error_rate=${dbl.error_rate || ""}`);
}