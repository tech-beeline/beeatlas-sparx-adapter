import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"

export const BC_NAME = "Управление техническими возможностями"
export const BC_DESCRIPTION = "Управление техническими возможностями и их реализацией"
export const TC_LIST_RESOURCE = '/api/v4/tc';


export const GET_ALL_SPEC = {
    tags: [BC_NAME],
    summary: "Получение списка бизнес-воможностей",
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


const PATHS = {
    [TC_LIST_RESOURCE]: {
        get: GET_ALL_SPEC
    }
}

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
        parents: { type: "array", items: { type: "string", description: "Код бизнес-возможности" }, description: "Список кодов бизнес-возможностей, в автоматизации которых участвует данная техническая возможность", example: ["BC-0001", "BC-0002"] },
        targetSystemCode: stringProperty("Код системы, которая отвечает за целевую реализацию технической возможности", "FDMSHOWCASEAPP"),
        owner: stringProperty("Владелец технической возможности", { example: "John Doe" }),
        version: stringProperty("Версия возможности", { example: "1.0.1" }),
        goal_from: stringProperty("Дата, когда планириуется начать предоставлять техническую возможность", { example: "24Q3" }),
        goal_to: stringProperty("Дата, до которой данная возможность не является устаревшей", { example: "25Q4" })
    }
}

const SCHEMAS = {
    TechnicalCapability: TC_SCHEMA
}

const SWAGGER = buildServiceSwagger(BC_NAME, BC_DESCRIPTION, CONTACT, API_VERSION, PATHS, { schemas: SCHEMAS })

export default SWAGGER;