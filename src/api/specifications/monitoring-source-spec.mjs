import monitoringSourcesControllers from "../controllers/monitiring-sources-controllers.mjs";
import { GetJSONOperation, JSONOperation, SimpleServiceSpecification, arraySchema, booleanProperty, buildServiceSwagger, dateTimeProperty, numberProperty, schemasRef, stringProperty } from "./helpers.mjs"
import { SYSTEM_CODE_PARAMETER } from "./system-service-spec/index.mjs";

export const BC_NAME = "Управление источниками мониторинга"
export const BC_DESCRIPTION = "Управление техническими возможностями и их реализацией"
export const SOURCE_LIST_RESOURCE = '/api/v4/monitoring/sources';
export const SYSTEM_SOURCE_RESOURCE = '/api/v4/monitoring/systems/{code}/source';
export const SYSTEM_OBJECTS_RESOURCE = '/api/v4/monitoring/objects/source';


const SWAGGER = new SimpleServiceSpecification(BC_NAME, BC_DESCRIPTION);

//#region схемы сущностей
const OBJECT_API_TEMPLATE_SCHEMA = SWAGGER.defineEntitySchema("GrafanaSource", {
    type: "object",
    properties: {
        object_id: numberProperty("Идентификатор обьекта", { example : 165028}),
        apiMetricTemplate: stringProperty("Ссылка на шаблон для получения метрик", {
            example: "https://inside.beeline.ru/d/hwzG1EcNz/opensearch-template-api-queries?orgId=1"
        })
    }
});
//#endregion

SWAGGER.definePost(SYSTEM_SOURCE_RESOURCE, new JSONOperation("Обновление настроек мониторинга", [SYSTEM_CODE_PARAMETER], OBJECT_API_TEMPLATE_SCHEMA, OBJECT_API_TEMPLATE_SCHEMA, monitoringSourcesControllers.postSystemSource))
    .definePost(SYSTEM_OBJECTS_RESOURCE, new JSONOperation("Обновление настроек мониторинга", null, OBJECT_API_TEMPLATE_SCHEMA, OBJECT_API_TEMPLATE_SCHEMA, monitoringSourcesControllers.postObjectSource))

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