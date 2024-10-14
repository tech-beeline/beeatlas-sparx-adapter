import { stringProperty } from "../helpers.mjs";

//#region Определение типов
export const E2E_PROCESS_SCHEMA = {
    type: "object",
    properties: {
        uid: stringProperty("Идентификатор Е2Е процесса", { example: "{5DE220EF-4CC4-4adb-AB5B-C49223DB7ED4}" }),
        name: stringProperty("Название Е2Е процесса", { example: "Я, как ..." }),
        version: stringProperty("Версия", { example: "1.0.0" }),
        links: {
            type : "object",
            properties : {
                self: stringProperty("Ссылка на описание процесса"),
                scenarios: stringProperty("Ссылка сценнарии сквозного е2е прцоесса")
            }
        }
    }
};

export const E2E_MESSAGE_SCHEMA = {
    type: "object",
    properties: {
        uid: stringProperty("Идентфиикатор сообщения"),
        name: stringProperty("Название сообщения")
    }
};

