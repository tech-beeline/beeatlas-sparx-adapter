import { GetJSONOperation, JSONOperation, pathParameter, SimpleServiceSpecification, stringProperty } from "../../specifications/helpers.mjs";
import { MaintenanceController } from "../controller.mjs";


const controller = new MaintenanceController();

const SWAGGER = new SimpleServiceSpecification(`Поддержка витрины ФДМ`, `Управление служебными и диагностическими возможностями`);
const METHOD_DOUBLES_REF = SWAGGER.defineEntitySchema("MethodDouble", {
    type: "object",
    properties: {
        code: stringProperty("Код интерфейса"),
        uid: stringProperty("Уникальный идентификатор интерфейса"),
        FQName: stringProperty("Путь в ЕА, где находится интерфейс"),
        name: stringProperty("Название интерфейса", { example: "Поиск чего-нибудь" }),
        doubles: {
            type: "object",
            additionalProperties: {
                type: "object",
                propeties: {
                    name: stringProperty("Имя метода", { example: " GET /endpoint" }),
                    uid: stringProperty("Уникальный идентификатор метода", { example: "{A05EA2A2-AF37-4BB3-B9FD-AD1E6B3CF73C}" }),
                    methods: {
                        type: "array",
                        item: {
                            type: "object",
                            properties: {
                                name: stringProperty("Имя метода", { example: " GET /endpoint" }),
                                uid: stringProperty("Название метода"),
                                diagrams: {
                                    type: "array",
                                    item: {
                                        type: "object",
                                        properties: {
                                            name: stringProperty("Название диаграммы"),
                                            uid: stringProperty("Идентификатор диаграммы")
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                example: {
                    name: "Название"
                }
            }
        }
    }
})

SWAGGER.defineGet("/api/v4/maintenance/methods-doubles", new GetJSONOperation("Получение дублей методов", [],
    METHOD_DOUBLES_REF, controller.getMethodsDoubles
)).defineDelete("/api/v4/maintenance/methods-doubles/{uid}",
    new JSONOperation("Удаление дубля метода",
        [pathParameter("uid", "Универсальный идентификатор метода","{A05EA2A2-AF37-4BB3-B9FD-AD1E6B3CF73C}")],
        null,
        {
            type: "object"
        }, controller.deleteMethodDouble));

export default SWAGGER;