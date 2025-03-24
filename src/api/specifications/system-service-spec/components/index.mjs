import { stringProperty } from "../../helpers.mjs";

export const METHOD_SLA_SCHEMA = {
    type: "object",
    properties: {
        rps: stringProperty("Траффик, запросы в минуту", { example: "10" }),
        latency: stringProperty("Максимальное время отклика, миллисекунды", { example: "1000" }),
        error_rate: stringProperty("Допустимый процент ошибок", { example: "0.1" }),
        method_name: stringProperty("Имя метода", { example: "GET /api/v4/glossaries" }),
        interface_code: stringProperty("Код интерфейса", { example: "business-terms-api.dashboard.FDMSHOWCASEAPP" }),
        interface_uid: stringProperty("Уникальный идентификатор интефрейса", { example: "{CE90DD6C-0EFA-4E13-BE5E-9BFAD5470A13}" }),
    }
}
