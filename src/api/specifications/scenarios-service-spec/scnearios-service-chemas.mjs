import { stringProperty } from "../helpers.mjs";

export const SCENARIO_SCHEMA = {
    type: "object",
    properties: {
        uid: stringProperty("Идентификатор сценария"),
        name: stringProperty("Имя сценария"),
        version: stringProperty("Версия", { example: "1.0.0" }),
        links : {
            self: stringProperty("Ссылка на описание сценария")
        }
    }
};
