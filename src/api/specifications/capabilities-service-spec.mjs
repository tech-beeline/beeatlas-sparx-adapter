import controllers from "../controllers/capabilities-controllers.mjs";
import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"
import { CAPABILITY_LIST_RESOURCE_V4, CAPABILITY_RESOURCE_V4 } from "./paths.mjs";

export const CAPABILITY_SERVICE_NAME = "Управление бизнес-возможностями"
export const CAPABILITY_SERVICE_DESCRIPTION = "Управление возможностями и доменами"




export const BC_LINK_SCHEMA = {
    type: "object",
    properties: {
        code: stringProperty("Код бизнес-возможности", { example: "DMN.153" }),
        name: stringProperty("Название бизнес-возможности", { example: "Проектирование технического решения ИТ-продукта" }),
        href: stringProperty("Ссылка на бизнес-возможность", { example: `http://company${CAPABILITY_LIST_RESOURCE_V4}/DMN.153` })
    }
}

export const CAPABILITY_SCHEMA_NAME = 'Capability'
export const CAPABILITY_REF = schemasRef(CAPABILITY_SCHEMA_NAME)

export const CAPABILITY_SCHEMA = {
    type: "object",
    description: "Информация о бизнес-возможности",
    properties: {
        code: stringProperty("Код бизнес-возможности", { example: "BC-018364" }),
        isDomain: booleanProperty("Признак домена. true - Домен или группа, false -  возможность"),
        name: stringProperty("Название бизнес-возможности", { example: "Высокоуровневое проектирование продукта" }),
        description: stringProperty("Описание бизнес-возможности"),
        author: stringProperty("Кто создал", { example: "Иванов Петр" }),
        status: stringProperty("Статус бизнес-возможности", { example: "Черновик" }),
        createdDate: dateTimeProperty("Дата создания"),
        modifieddDate: dateTimeProperty("Дата последнего изменения"),
        parent: { description: "Родительская бизнес-воможность", ...BC_LINK_SCHEMA },
        children: {
            type: "array",
            items: {
                type: "object",
                schema: CAPABILITY_REF
            },
            description: "Дочерние бизнес-возможности"
        },
        self: stringProperty("Ссылка на роадительскую бизнес-возможность", { example: `http://company${CAPABILITY_LIST_RESOURCE_V4}/BC-018364` })
    }
};



export const GET_ALL_SPEC = {
    tags: [CAPABILITY_SERVICE_NAME],
    summary: "Получение списка бизнес-воможностей",
    controller: controllers.getAll,
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: CAPABILITY_REF
                    }
                }
            }
        }
    }
}

export const GET_BY_CODE_SPEC = {
    tags: [CAPABILITY_SERVICE_NAME],
    summary: "Получение информации о бизнес-возможнорсти по коду",
    controller: controllers.getByCode,
    parameters: [
        {
            name: "code",
            in: "path",
            description: "Код бизнес-возможности",
            required: true,
            example: "GRP.001"
        }
    ],
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: CAPABILITY_REF
                }
            }
        }
    }
}

const PATHS = {
    [CAPABILITY_LIST_RESOURCE_V4]: {
        get: GET_ALL_SPEC
    },
    [CAPABILITY_RESOURCE_V4]: {
        get: GET_BY_CODE_SPEC
    }
}



const SCHEMAS = {
    Capability: CAPABILITY_SCHEMA
}

const SWAGGER = buildServiceSwagger(CAPABILITY_SERVICE_NAME, CAPABILITY_SERVICE_DESCRIPTION, CONTACT, API_VERSION, PATHS, { schemas: SCHEMAS })

export default SWAGGER;