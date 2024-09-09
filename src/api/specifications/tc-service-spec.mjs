import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { BC_LINK_SCHEMA } from "./capabilities-service-spec.mjs";
import { booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"

export const TC_SERVICE_NAME = "Управление техническими возможностями"
export const TC_SERVICE_DESCRIPTION = "Управление техническими возможностями и их реализацией"

export const TC_LIST_RESOURCE_V4 = '/api/v4/tc';
export const TC_RESOURCE_V4 = '/api/v4/tc/{code}';

const SYSTEM_LINK_SCHEMA = {
    type: "object",
    properties: {
        code: stringProperty("Код системы", { example: "FDMSHOWCASEAPP" }),
        name: stringProperty("Название системы", { example: "Витрина ФДМ" }),
        href: stringProperty("Ссылка на систему", { example: `https://company/api/vX/systems/FDMSHOWCASEAPP` })
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
        parents: {
            type: "array",
            items: BC_LINK_SCHEMA,
            description: "Список бизнес-возможностей, в автоматизации которых участвует данная техническая возможность",
            //example: ["BC-0001", "BC-0002"]
        },
        //targetSystemCode: stringProperty("Код системы, которая отвечает за целевую реализацию технической возможности", "FDMSHOWCASEAPP"),
        system: SYSTEM_LINK_SCHEMA,
        owner: stringProperty("Владелец технической возможности", { example: "John Doe" }),
        version: stringProperty("Версия возможности", { example: "1.0.1" }),
        goal_from: stringProperty("Дата, когда планириуется начать предоставлять техническую возможность", { example: "24Q3" }),
        goal_to: stringProperty("Дата, до которой данная возможность не является устаревшей", { example: "25Q4" })
    }
}
const tcSchemaRef = schemasRef( "TechnicalCapability")



export const GET_ALL_SPEC = {
    tags: [TC_SERVICE_NAME],
    summary: "Получение списка технических воможностей",
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

export const GET_TC_SPEC = {
    tags: [TC_SERVICE_NAME],
    summary: "Получение информации о тьехнической возможности по коду",
    parameters: [
        {
            name: "code",
            in: "path",
            description: "Код технической возможности",
            required: true,
            example: "FDMSHOWCASEAPP.001"
        }
    ],
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
    requesBode: {
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

const PATHS = {
    [TC_LIST_RESOURCE_V4]: {
        get: GET_ALL_SPEC
    },
    [TC_RESOURCE_V4]: {
        get: GET_TC_SPEC,
        put: PUT_TC_SPEC
    }
}


const SCHEMAS = {
    TechnicalCapability: TC_SCHEMA
}

const SWAGGER = buildServiceSwagger(TC_SERVICE_NAME, TC_SERVICE_DESCRIPTION, CONTACT, API_VERSION, PATHS, { schemas: SCHEMAS })

export default SWAGGER;