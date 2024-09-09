import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"

export const INTERFACES_SERVICE_NAME = "Управление информацией об интерфейсах"
export const INTERFACES_SERVICE_DESCRIPTION = "Управление информацией об интерфейсах, включая спецификацию и нефункциональные требования"

export const INTERFACE_LIST_RESOURCE_V4 = '/api/v4/interfaces';
export const INTERFACE_RESOURCE_V4 = '/api/v4/interfaces/{code}';


export const METHOD_SCHEMA = {
    type: "object",
    properties: {
        name: stringProperty("Имя метода")
    }
}
export const METHOD_SCHEMA_REF = schemasRef("Method");

export const INTERFACE_SCHEMA = {
    type: "object",
    properties: {
        code: stringProperty("Код интерфейса"),
        name: stringProperty("Имия интерфейса"),
        description: stringProperty("Описание интерфейса", { example: "Подробно о" }),
        version: stringProperty("Версия интерфейса", { example: "1.0.0" }),
        protocol: stringProperty("Протокол", { example: "rest" }),
        specification: stringProperty("Ссылка на спецификацию"),
        methods: {
            type : "array",
            items: METHOD_SCHEMA_REF
        },
        self: stringProperty("Ссылка на интерфейс")
    }
}
export const INTERFACE_SCHEMA_REF = schemasRef("Interface");


export const GET_ALL_SPEC = {
    tags: [INTERFACES_SERVICE_NAME],
    summary: "Получение списка интерфейсов",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: INTERFACE_SCHEMA_REF
                    }
                }
            }
        }
    }
}

export const GET_BY_CODE_SPEC = {
    tags: [INTERFACES_SERVICE_NAME],
    summary: "Получение информации об интерфейсе",
    parameters: [
        {
            name: "code",
            in: "path",
            description: "Код технической возможности",
            required: true,
            example: "GRP.001"
        }
    ],
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: INTERFACE_SCHEMA_REF
                }
            }
        }
    }
}


const PATHS = {
    [INTERFACE_LIST_RESOURCE_V4]: {
        get: GET_ALL_SPEC
    },
    [INTERFACE_RESOURCE_V4]: {
        get: GET_BY_CODE_SPEC
    }
}


const SCHEMAS = {
    Interface: INTERFACE_SCHEMA,
    Method: METHOD_SCHEMA
}

const SWAGGER = buildServiceSwagger(INTERFACES_SERVICE_NAME, INTERFACES_SERVICE_DESCRIPTION, CONTACT, API_VERSION, PATHS, { schemas: SCHEMAS })

export default SWAGGER;