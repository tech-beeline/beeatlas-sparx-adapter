import { stringProperty } from "../../helpers.mjs";

export const PUBLISH_APPLICATION_OPIONS_SCHEMA = {
    type: "object",
    properties: {
        systemCode: stringProperty("Код приложения", { example: "FDMSHOWCASEAPP" })
    }
};

export const PUBLISH_APPLICATION_RESULT_SCHEMA = {
    type: "object",
    properties: {
        systemCode: stringProperty("Код приложения", { example: "FDMSHOWCASEAPP" }),
        dashboardPath: stringProperty( "Путь к созданному или обновленному дашборду", {example: "https://inside.beeline.ru/d/<asddddsa>"})
    }
};