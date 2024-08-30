import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"

export const BC_NAME = "Управление информацией о Е2Е процессах"
export const BC_DESCRIPTION = "Управление информацией о Е2Е процесса"

export const E2E_LIST_RESOURCE = "/api/v4/e2e"
export const E2E_RESOURCE = "/api/v4/e2e/{uid}"

export const GET_ALL_E2E = {
    tags: [BC_NAME],
    summary: "Получение списка Е2Е процессов",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: schemasRef('E2EProcess')
                    }
                }
            }
        }
    }
}

export const GET_E2E = {
    tags: [BC_NAME],
    summary: "Получение Е2Е процессов по идентификатору",
    parameters: [
        {
            name: "uid",
            in: "path",
            description: "Идентификатор Е2Е процесса",
            required: true,
            example: "{5DE220EF-4CC4-4adb-AB5B-C49223DB7ED4}"
        }
    ],
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: schemasRef('E2EProcess')
                }
            }
        }
    }
}


const PATHS = {
    [E2E_LIST_RESOURCE]: {
        get: GET_ALL_E2E
    },
    [E2E_RESOURCE]: {
        get: GET_E2E
    }
}

export const E2E_SCHEMA = {
    type: "object",
    properties: {
        uid: stringProperty("Идентификатор Е2Е процесса", { example: "{5DE220EF-4CC4-4adb-AB5B-C49223DB7ED4}" }),
        name: stringProperty("Название Е2Е процесса" , {example : "Я, как ..."}),
    }
}

const SCHEMAS = {
    E2EProcess: E2E_SCHEMA
}

const SWAGGER = buildServiceSwagger(BC_NAME, BC_DESCRIPTION, CONTACT, API_VERSION, PATHS, { schemas: SCHEMAS })

export default SWAGGER;