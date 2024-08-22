import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"

export const BC_NAME = "Управление бизнес-возможностями"
export const BC_DESCRIPTION = "Управление возможностями и доменами"
export const CAPABILITIES_RESOURCE = "/api/v4/capabilities";
export const CAPABILITY_RESOURCE = "/api/v4/capabilities/{code}";

export const GET_ALL_SPEC = {
    tags: [BC_NAME],
    summary: "Получение списка бизнес-воможностей",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: schemasRef('Capability')
                    }
                }
            }
        }
    }
}

export const GET_BY_CODE_SPEC = {
    tags: [BC_NAME],
    summary: "Получение информации о бизнес-возможнорсти по коду",
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
                    schema: schemasRef('Capability')
                }
            }
        }
    }
}

const PATHS = {
    [CAPABILITIES_RESOURCE]: {
        get: GET_ALL_SPEC
    },
    [CAPABILITY_RESOURCE]: {
        get: GET_BY_CODE_SPEC
    }
}

export const CAPABILITY_SCHEMA = {
    type: "object",
    description: "Информация о бизнес-возможности",
    properties: {
        code: stringProperty("Код бизнес-возможности", { example: "GRP.001" }),
        isDomain: booleanProperty("Признак домена. true - Домен или группа, false -  возможность"),
        name: stringProperty("Название бизнес-возможности"),
        description: stringProperty("Описание бизнес-возможности"),
        author: stringProperty("Кто создал"),
        createdDate: dateTimeProperty("Дата создания"),
        modifieddDate: dateTimeProperty("Дата последнего изменения")
    }
};

const SCHEMAS = {
    Capability: {
        type: "object",
        description: "Информация о бизнес-возможности",
        properties: {
            code: stringProperty("Код бизнес-возможности", { example: "GRP.001" }),
            isDomain: booleanProperty("Признак домена. true - Домен или группа, false -  возможность"),
            name: stringProperty("Название бизнес-возможности"),
            description: stringProperty("Описание бизнес-возможности"),
            author: stringProperty("Кто создал"),
            createdDate: dateTimeProperty("Дата создания"),
            modifieddDate: dateTimeProperty("Дата последнего изменения")
        }
    }
}

const SWAGGER = buildServiceSwagger(BC_NAME, BC_DESCRIPTION, CONTACT, API_VERSION, PATHS, { schemas: SCHEMAS })

export default SWAGGER;