import tcController from "../controllers/tc-controllers.mjs";
import { BC_LINK_SCHEMA } from "./capabilities-service-spec.mjs";
import { GetJSONOperation, JSONOperation, SimpleServiceSpecification, arraySchema, booleanProperty, buildServiceSwagger, dateTimeProperty, pathParameter, queryParameter, schemasRef, stringProperty } from "./helpers.mjs"
import { TC_LIST_RESOURCE, TC_POSITION_RESOURCE, TC_RESOURCE, TC_SEARCH_RESOURCE } from "./paths.mjs";

export const TC_SERVICE_NAME = "Управление техническими возможностями"
export const TC_SERVICE_DESCRIPTION = "Управление техническими возможностями и их реализацией"

const SWAGGER = new SimpleServiceSpecification(TC_SERVICE_NAME, TC_SERVICE_DESCRIPTION);

//#region Определение типов

const SYSTEM_LINK_SCHEMA = SWAGGER.defineEntitySchema("SystemLink", {
    type: "object",
    properties: {
        code: stringProperty("Код системы", { example: "FDMSHOWCASEAPP" }),
        name: stringProperty("Название системы", { example: "Витрина ФДМ" }),
        href: stringProperty("Ссылка на систему", { example: `https://company/api/vX/systems/FDMSHOWCASEAPP` })
    }
});

export const TC_SCHEMA = {
    type: "object",
    properties: {
        code: stringProperty("Код технической возможности", { example: "FDMSHOWCASEAPP.001" }),
        name: stringProperty("Название технической возможности"),
        description: stringProperty("Описание технической возможности"),
        author: stringProperty("Кто создат техническую возможность", { example: "John Doe" }),
        createdDate: dateTimeProperty("Дата создания технической возможности"),
        modifiedDate: dateTimeProperty("Дата последнего изменения"),
        status: stringProperty("Текущий статус"),
        parents: {
            type: "array",
            items: BC_LINK_SCHEMA,
            description: "Список бизнес-возможностей, в автоматизации которых участвует данная техническая возможность",
        },
        system: SYSTEM_LINK_SCHEMA,
        owner: stringProperty("Владелец технической возможности", { example: "John Doe" }),
        version: stringProperty("Версия возможности", { example: "1.0.1" }),
        goal_from: stringProperty("Дата, когда планириуется начать предоставлять техническую возможность", { example: "24Q3" }),
        goal_to: stringProperty("Дата, до которой данная возможность не является устаревшей", { example: "25Q4" })
    }
};

const TC_SCHEMA_REF = SWAGGER.defineEntitySchema("TechnicalCapability", TC_SCHEMA);
//#endregion

//#region Определение параметров
const TC_CODE_PARAMETER = pathParameter("code", "Код технической возможности", "FDMSHOWCASEAPP.001");
const SEARCR_TERMS_PARAMETER = queryParameter("terms", "Поисковая строка", true, "проектирование");
//#endregion

//#region Определение методов
SWAGGER
    .defineGet(TC_SEARCH_RESOURCE,
        new GetJSONOperation("Поиск технической возможности по названию", [SEARCR_TERMS_PARAMETER], arraySchema(TC_SCHEMA_REF)))
    .defineGet(TC_LIST_RESOURCE,
        new GetJSONOperation("Получение списка всех тeхнических возможностей", null, arraySchema(TC_SCHEMA_REF))
            .setContoller(tcController.getAll))
    .defineGet(TC_RESOURCE,
        new GetJSONOperation("Получение описания технической возможности по коду", [TC_CODE_PARAMETER], TC_SCHEMA_REF)
            .setContoller(tcController.getByCode))
    .definePut(TC_RESOURCE, new JSONOperation(
        "Обновление описания технической возможности", [TC_CODE_PARAMETER],
        TC_SCHEMA_REF, TC_SCHEMA_REF))
    .defineGet(TC_POSITION_RESOURCE,
        new GetJSONOperation("Получение информации о позиционировании в ФДМ", [TC_CODE_PARAMETER], TC_SCHEMA_REF));
//#endregion

export default SWAGGER;

/*
const PUT_TC_SPEC = {
    tags: [TC_SERVICE_NAME],
    summary: "Обновление инфорации о TC",
    parameters: [
        {
            name: "code",
            in: "path",
            description: "Код технической возможности",
            required: true,
            example: "FDMSHOWCASEAPP.001"
        }
    ],
    requestBode: {
        content : {
            "application/json" : {
                schema: tcSchemaRef
            }
        }
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: schemasRef('TechnicalCapability')
                    }
                }
            }
        }
    }
}
*/