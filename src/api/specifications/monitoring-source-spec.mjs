import monitiringSourcesControllers from "../controllers/monitiring-sources-controllers.mjs";
import { GetJSONOperation, SimpleServiceSpecification, arraySchema, booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"
import { SYSTEM_CODE_PARAMETER } from "./systems-service-spec.mjs";

export const BC_NAME = "Управление источниками мониторинга"
export const BC_DESCRIPTION = "Управление техническими возможностями и их реализацией"
export const SOURCE_LIST_RESOURCE = '/api/v4/monitoring/sources';
export const SYSTEM_SOURCE_RESOURCE = '/api/v4/monitoring/systems/{code}/source';


const SWAGGER = new SimpleServiceSpecification(BC_NAME, BC_DESCRIPTION);

//#region схемы сущностей
const GRAFANA_SOURCE_SCHEME = SWAGGER.defineEntitySchema("GrafanaSource", {
    type: "object",
    properties: {
        name: stringProperty("Название настройки"),
        uid: stringProperty("Идентификатор")
    }
})
//#endregion

SWAGGER.defineGet(SOURCE_LIST_RESOURCE, new GetJSONOperation("Получение списка источников", null, arraySchema(GRAFANA_SOURCE_SCHEME), monitiringSourcesControllers.getAll))
    .defineGet(SYSTEM_SOURCE_RESOURCE, new GetJSONOperation("Получение источника для системы", [SYSTEM_CODE_PARAMETER], GRAFANA_SOURCE_SCHEME, monitiringSourcesControllers.getSystemSource))

export const GET_SOURCES = {
    tags: [BC_NAME],
    summary: "Получение списка бизнес-воможностей",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: schemasRef('GrafanaSource')
                    },
                    example: [{
                        "name": "opensearch-Ingress",
                        "uid": "{4306CB3F-1CEC-4ccc-BF80-D9E814E9BAAB}",
                        "type": "opensearch",
                        "sourceId": "lTk_e61Iz",
                        "properties": {},
                        "opensearch-api-query-success": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\" AND json.status: [100 TO 299] 404",
                        "opensearch-api-query-error": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\" AND NOT(json.status: [100 TO 299] 404)",
                        "opensearch-api-query-total": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\"",
                        "opensearch-request-time-field": "json.request_time"
                    }]
                }
            }
        }
    }
}

export const GET_SYSTEM_SOURCE = {
    tags: [BC_NAME],
    summary: "Получение источника метрик для системы",
    parameters: [
        {
            name: "code",
            in: "path",
            required: true,
            description: "Код системы",
            example: "FDMSHOWCASEAPP"
        }],
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: schemasRef('GrafanaSource')
                }
            }
        }
    }
}

export const POST_SYSTEM_SOURCE = {
    tags: [BC_NAME],
    summary: "Установка источника метрик для системы",
    parameters: [
        {
            name: "code",
            in: "path",
            required: true,
            description: "Код системы",
            example: "FDMSHOWCASEAPP"
        }],
    requestBody: {
        content: {
            "application/json": {
                schema: schemasRef("GrafanaSource"),
                example: {
                    uid: "{4306CB3F-1CEC-4ccc-BF80-D9E814E9BAAB}"
                }
            }
        }
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: schemasRef('GrafanaSource'),
                    example: {
                        "name": "opensearch-Ingress",
                        "uid": "{4306CB3F-1CEC-4ccc-BF80-D9E814E9BAAB}",
                        "type": "opensearch",
                        "sourceId": "lTk_e61Iz",
                        "properties": {},
                        "opensearch-api-query-success": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\" AND json.status: [100 TO 299] 404",
                        "opensearch-api-query-error": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\" AND NOT(json.status: [100 TO 299] 404)",
                        "opensearch-api-query-total": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\"",
                        "opensearch-request-time-field": "json.request_time"
                    }
                }
            }
        }
    }
}

export const POST_SOURCE = {
    tags: [BC_NAME],
    summary: "создание/изменение параметров источника",
    requestBody: {
        content: {
            "application/json": {
                schema: schemasRef("GrafanaSource"),
                example: {
                    "name": "opensearch-Sample",
                    "uid": "{4306CB3F-1CEC-4ccc-BF80-D9E814E9BAAB}",
                    "type": "opensearch",
                    "sourceId": "lTk_e61Iz",
                    "properties": {},
                    "opensearch-api-query-success": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\" AND json.status: [100 TO 299] 404",
                    "opensearch-api-query-error": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\" AND NOT(json.status: [100 TO 299] 404)",
                    "opensearch-api-query-total": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\"",
                    "opensearch-request-time-field": "json.request_time"
                }
            }
        }
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: schemasRef('GrafanaSource'),
                    example: {
                        "name": "opensearch-Ingress",
                        "uid": "{4306CB3F-1CEC-4ccc-BF80-D9E814E9BAAB}",
                        "type": "opensearch",
                        "sourceId": "lTk_e61Iz",
                        "properties": {},
                        "opensearch-api-query-success": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\" AND json.status: [100 TO 299] 404",
                        "opensearch-api-query-error": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\" AND NOT(json.status: [100 TO 299] 404)",
                        "opensearch-api-query-total": "json.request_uri: \"/${uri_regex}/\" AND json.request_method: \"${method}\"",
                        "opensearch-request-time-field": "json.request_time"
                    }
                }
            }
        }
    }
}




export default SWAGGER;