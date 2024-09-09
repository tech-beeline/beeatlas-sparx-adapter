import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { BAD_REQUST_RESPONSE, booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"


export const OBSERVABILITY_SERVICE_NAME = "Управление сервисами наблюдаемости"
export const OBSERVABILITY_SERVICE_DESCRIPTION = "Управление источниками метрик, порогами и витринами"


export const OBSERVABILITY_SOURCES_RESOURCE_V4 = "/api/v4/observability/sources"

const OBSERVABILTITY_SOURCE_SCHEMA_NAME = 'ObservabilitySource'
const OBSERVABILTITY_SOURCE_SCHEMA = {
    type: "object",
    properties: {

    }
}

const OBSERVABILTIY_SOURCE_REF = schemasRef(OBSERVABILTITY_SOURCE_SCHEMA_NAME)

const GET_SOURCE_LIST_SPEC = {
    tags: [OBSERVABILITY_SERVICE_NAME],
    summary: "Получение информации обо всех источниках метрик",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: schemasRef('System')
                    }
                }
            }
        },
        400: { $ref: "#/components/responses/400" }
    }
}

const PATHS = {
    [OBSERVABILITY_SOURCES_RESOURCE_V4]: {
        get: GET_SOURCE_LIST_SPEC
    }
}

const SCHEMAS = {
    [OBSERVABILTITY_SOURCE_SCHEMA_NAME]: OBSERVABILTITY_SOURCE_SCHEMA
}

const SWAGGER = buildServiceSwagger(
    OBSERVABILITY_SERVICE_NAME, OBSERVABILITY_SERVICE_DESCRIPTION,
    CONTACT, API_VERSION,
    PATHS,
    { schemas: SCHEMAS, responses: { 400: BAD_REQUST_RESPONSE } })

export default SWAGGER;