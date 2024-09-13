import { BAD_REQUST_RESPONSE, GetJSONOperation, JSONOperation, SimpleServiceSpecification, arraySchema, booleanProperty, buildServiceSwagger, dateTimeProperty, pathParameter, queryParameter, schemasRef, stringProperty } from "./helpers.mjs"
import { CAPABILITY_SCHEMA } from "./capabilities-service-spec.mjs";
import { TC_SCHEMA } from "./tc-service-spec.mjs";
import { INTERFACE_SCHEMA, METHOD_SCHEMA } from "./interfaces-service-spec.mjs";
import { SYSTEM_ASSESSMENTS_RESOURCE, SYSTEM_E2E_RESOURCE, SYSTEM_LIST_RESOURCE, SYSTEM_PURPOSE_RESOURCE, SYSTEM_RESOURCE, SYSTEM_SEARCH_RESOURCE } from "./paths.mjs";
import { SYSTEM_ASSESSMENT_RESULT_SCHEMA, SYSTEM_PURPOSE_SCHEMA } from "../model/system.mjs";
import systemsControllers from "../controllers/systems-controllers.mjs";

export const SYSTEM_SERVICE_NAME = "Управление информацией о системах"
export const SYSTEM_SERVICE_DESCRIPTION = "Поиск, получение и изменение информации о системе"

const SYSTEM_SEARCH_SUMMARY = "Поиск системы";
const GET_SYSTEM_LIST_SUMMARY = "Получение списка систем";
const GET_SYSTEM_SUMMARY = "Получение описания системы по ее коду";
const PUT_SYSTEM_SUMMARY = "Обновление описания системы";
const GET_SYSTEM_PURPOSE_SUMMARY = "Получение назначения системы";
const GET_SYSTEM_E2E_SUMMARY = "Получение информации о том, в какиих Е2Е процессах участвует система";
const GET_SYSTEM_ASSESSMENT_SUMMARY = "Актуальная оценка системы";
const POST_SYSTEM_ASSESSMENT_SUMMARY = "Публикация результата оценки системы архитектурной фитнес-функцией";



const SWAGGER = new SimpleServiceSpecification(SYSTEM_SERVICE_NAME, SYSTEM_SERVICE_DESCRIPTION);

//#region Определение типов

const METHOD_SCHEMA_REF = SWAGGER.defineEntitySchema("Method", METHOD_SCHEMA);
const INTERFACE_SCHEMA_REF = SWAGGER.defineEntitySchema("Interface", INTERFACE_SCHEMA);

const CONTAINER_SCHEMA = SWAGGER.defineEntitySchema("Container", {
    type: "object",
    properties: {
        code: stringProperty("Код контейнера", { example: "BACKEND" }),
        name: stringProperty("Название контейнера", { example: "Backend service" }),
        description: stringProperty("Описание контейнера", { example: "Подробное описание" }),
        version: stringProperty("Версия контейнера", { example: "1.0.0" }),
        interfaces: {
            type: "array",
            items: INTERFACE_SCHEMA_REF
        }
    }
});

const SYSTEM_SCHEMA = SWAGGER.defineEntitySchema("System", {
    type: "object",
    properties: {
        code: stringProperty("Код системы в CMDB", { example: "SYSTEM" }),
        name: stringProperty("Название системы", { example: "The System" }),
        description: stringProperty("Описание системы", { example: "Oooooops" }),
        version: stringProperty("Версия системы", { example: "1.0.0" }),
        author: stringProperty("Кто создал систему"),
        ea_guid: stringProperty("Уникальный идентификатор системы", { example: "{CF941E07-7384-4059-BE05-7780932121D5}" }),
        FQName: stringProperty("Полное имя системы", { example: "IT-Landscape Catalog/BIT/The System" }),
        status: stringProperty("Статус системы", { example: "В эксплуатации" }),
        modifiedDate: dateTimeProperty("Даат последнего изменения"),
        containers: {
            type: "array",
            items: CONTAINER_SCHEMA
        },
        links: {
            type: "object",
            description: "Ресурсы, связанные с системой",
            properties: {
                self: stringProperty("Ссылка на описание системы"),
                purpose: stringProperty("Назначение (позиционирование) системы"),
                e2e: stringProperty("В каких процессах система принимает участие"),
                assessments: stringProperty("Архитектурная оценка система")
            }
        }
    }
});

const SYSTEM_PURPOSE_SCHEMA_REF = SWAGGER.defineEntitySchema("SystemPuprose", SYSTEM_PURPOSE_SCHEMA);

const SYSTEM_E2E_PARTICIPATION_SCHEMA = SWAGGER.defineEntitySchema("SystemE2EЗarticipation", {
    type: "object",
    properties: {
        process: {
            type: "object",
            properties: {
                name: stringProperty("Название процесса", { example: "Я, как клиент, хочу сменить тарфиный план" }),
                uid: stringProperty("Идентификатор процеса", { example: "{5DE220EF-4CC4-4adb-AB5B-C49223DB7ED4}" }),
                href: stringProperty("Ссылка на описание процесса", { example: "https://company/api/v4/%7B5DE220EF-4CC4-4adb-AB5B-C49223DB7ED4%7D" })
            },
            description: "Е2Е Процесс, в котром участвтует система"
        },
        bi: {
            type: "object",
            description: "Шаг Е2Е процесса (Business Interaction)",
            properties: {
                name: stringProperty("Название шага", { example: "Инициация смены тарифного плана" }),
                uid: stringProperty("Идентификатор шага", { example: "{A0FFE205-C420-4989-8B5B-69EE18FA6DBE}" }),
                href: stringProperty("Ссылка на описание процесса", { example: "https://company/api/v4/%7BA0FFE205-C420-4989-8B5B-69EE18FA6DBE%7D" })
            }
        },
        message: {
            type: "object",
            description: "Описание взаимодействия, в котром участвует система",
            properties: {
                name: stringProperty("Название взаимодействия"),
                operation: {
                    type: "object",
                    description: "Описание метода, используемого во взаимодействии",
                    properties: {
                        name: stringProperty('Название метода', { example: "GET /api/v4/systems" }),
                        uid: stringProperty("Идентификатор метода", { example: "{E78858BB-0193-45b6-BC4C-FEB2B6748879}" }),
                        interface: {
                            type: "object",
                            description: "Описание интерфейса",
                            properties: {
                                name: stringProperty("Имя интерфейса"),
                                code: stringProperty("Код интерфейса"),
                                href: stringProperty("Ссылка на описание интерфейса")
                            }
                        }
                    }
                }
            }
        },
        system: {
            type: "object",
            properties: {
                name: stringProperty("Название система", { example: "The System" }),
                code: stringProperty("Код системы", { example: "SYSTEM" }),
                href: stringProperty("Ссылка на описание системы", { example: "https://company/api/v4/systems/FDMSHOWCASEAPP" })
            }
        }
    }
})

const SYSTEM_ASSESSMENT_RESULT_SCHEMA_REF = SWAGGER.defineEntitySchema("SystemAssessmentResult", SYSTEM_ASSESSMENT_RESULT_SCHEMA)
//#endregion

//#region Определение параметров
const SEARCH_TERMS_PARAMETER = queryParameter("terms", "Поисковая строка", true, "system")
const SYSTEM_CODE_PARAMETER = pathParameter("code", "Код системы", "SYSTEM_CODE");
//#endregion

//#region Определение методов
SWAGGER
    .defineGet(SYSTEM_SEARCH_RESOURCE, new GetJSONOperation(SYSTEM_SEARCH_SUMMARY, [SEARCH_TERMS_PARAMETER], arraySchema(SYSTEM_SCHEMA)))
    .defineGet(SYSTEM_LIST_RESOURCE, new GetJSONOperation(GET_SYSTEM_LIST_SUMMARY, null, arraySchema(SYSTEM_SCHEMA), systemsControllers.getAll))
    .defineGet(SYSTEM_RESOURCE, new GetJSONOperation(GET_SYSTEM_SUMMARY, [SYSTEM_CODE_PARAMETER], SYSTEM_SCHEMA, systemsControllers.getByCode))
    .definePut(SYSTEM_RESOURCE, new JSONOperation(PUT_SYSTEM_SUMMARY, [SYSTEM_CODE_PARAMETER], SYSTEM_SCHEMA, SYSTEM_SCHEMA, systemsControllers.putSystem))
    .defineGet(SYSTEM_PURPOSE_RESOURCE, new GetJSONOperation(GET_SYSTEM_PURPOSE_SUMMARY, [SYSTEM_CODE_PARAMETER], SYSTEM_PURPOSE_SCHEMA_REF, systemsControllers.getPurpose))
    .defineGet(SYSTEM_E2E_RESOURCE, new GetJSONOperation(GET_SYSTEM_E2E_SUMMARY, [SYSTEM_CODE_PARAMETER], SYSTEM_E2E_PARTICIPATION_SCHEMA, systemsControllers.getE2EParticipition))
    .defineGet(SYSTEM_ASSESSMENTS_RESOURCE, new GetJSONOperation(GET_SYSTEM_ASSESSMENT_SUMMARY, [SYSTEM_CODE_PARAMETER], SYSTEM_ASSESSMENT_RESULT_SCHEMA_REF, systemsControllers.getSystemAssessments))
    .definePost(SYSTEM_ASSESSMENTS_RESOURCE, new JSONOperation(POST_SYSTEM_ASSESSMENT_SUMMARY, [SYSTEM_CODE_PARAMETER], SYSTEM_ASSESSMENT_RESULT_SCHEMA_REF, SYSTEM_ASSESSMENT_RESULT_SCHEMA_REF, systemsControllers.postSystemAssessment))
    ;
//#endregion

export default SWAGGER;
/*



export const SYSTEM_LINK_SCHEMA = {
    type: "object",
    properties: {
        code: stringProperty("Код системы", { example: "FDMSHOWCASEAPP" }),
        name: stringProperty("Название системы", { example: "Витрина ФДМ" }),
        href: stringProperty("Ссылка на систему", { example: `https://company/${SYSTEM_LIST_RESOURCE}/FDMSHOWCASEAPP` })
    }
}

export const GET_ALL_SPEC = {
    tags: [SYSTEM_SERVICE_NAME],
    summary: "Получение списка систем",
    controller : systemsControllers.getAll,
    parameters: [
        {
            name: "excludeContainers",
            summary: "Не добавлять информацию о контейнерах системы",
            description: "Не добавлять информацию о контейнерах системы",
            in: "query",
            required: false,
            schema: {
                type: "boolean",
                enum: ["true", "false"]
            }
        }],
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

const GET_BY_CODE_SPEC = {
    tags: [SYSTEM_SERVICE_NAME],
    summary: "Получение информации о системе",
    controller : systemsControllers.getByCode,
    parameters: [
        {
            name: "code",
            in: "path",
            required: true,
            description: "Код системы",
            example: "FDMSHOWCASEAPP"
        },
        {
            name: "excludeContainers",
            summary: "Не добавлять информацию о контейнерах системы",
            description: "Не добавлять информацию о контейнерах системы",
            in: "query",
            required: false,
            schema: {
                type: "boolean",
                enum: ["true", "false"]
            }
        },
        {
            name: "includeMethods",
            summary: "Добавить информацию о методах",
            description: "Добавить информацию о методах",
            in: "query",
            required: false,
            schema: {
                type: "boolean",
                enum: ["true", "false"]
            }
        }
    ],
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: schemasRef('System')
                }
            }
        },
        400: { $ref: "#/components/responses/400" },
        404: {
            description: "Система с указанным кодом не найдена",
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: {
                                type: "string",
                                example: "The system with the WRONG_CODE code was not found"
                            }
                        }
                    }
                }
            }
        }
    }
};

const PUT_SYSTEM = {
    tags: [SYSTEM_SERVICE_NAME],
    summary: "Обновление информации о системе и ее API",
    controller : systemsControllers.putSystem,
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

const GET_SYSTEM_E2E = {
    tags: [SYSTEM_SERVICE_NAME],
    summary: "Список е2е процессов, в котороых участвует система",
    controller : systemsControllers.getE2EParticipition,
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
                    schema: {
                        type: "array",
                        items: schemasRef('SystemE2EParticipation')
                    }
                }
            }
        },
        400: { $ref: "#/components/responses/400" }
    }

}

const GET_ASSESSMENT_SPEC = {
    tags: [SYSTEM_SERVICE_NAME],
    summary: "Список е2е процессов, в котороых участвует система",
    controller: systemsControllers.getSystemAssessments,
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
                    schema: {
                        type: "object",
                        properties: {
                            message: stringProperty("Информация о результате операции")
                        }
                    }
                }
            }
        },
        400: { $ref: "#/components/responses/400" }
    }

}

const POST_ASSESSMENT_SPEC = {
    tags: [SYSTEM_SERVICE_NAME],
    summary: "Публикация результатов архитектурной проверки",
    controller: systemsControllers.postSystemAssessment,
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
                schema: SYSTEM_ASSESSMENT_RESULT_SCHEMA_REF
            }
        }
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            message: stringProperty("Информация о результате операции")
                        }
                    }
                }
            }
        },
        400: { $ref: "#/components/responses/400" }
    }

}

const PATHS = {
    [SYSTEM_LIST_RESOURCE]: {
        get: GET_ALL_SPEC
    },
    [SYSTEM_RESOURCE]: {
        get: GET_BY_CODE_SPEC,
        put: PUT_SYSTEM
    },
    [SYSTEM_PURPOSE_RESOURCE]: {
        get: GET_CAPABILITIES
    },
    [SYSTEM_E2E_RESOURCE]: {
        get: GET_SYSTEM_E2E
    },
    [SYSTEM_ASSESSMENT_RESOURCE]: {
        get: GET_ASSESSMENT_SPEC,
        post: POST_ASSESSMENT_SPEC
    }
}

const SYSTEM_PURPOSE_SCHEMA = {
    type: "object",
    properties: {
        tc: schemasRef('TechnicalCapability'),
        bcList: {
            type: "array",
            items: schemasRef('Capability')
        }
    }
}

const SYSTEM_E2E_PARTICIPATION = {
    type: "object",
    properties: {
    }
}

const SCHEMAS = {
    SystemE2EParticipation: SYSTEM_E2E_PARTICIPATION,
    Capability: CAPABILITY_SCHEMA,
    TechnicalCapability: TC_SCHEMA,
    SystemPurpose: SYSTEM_PURPOSE_SCHEMA,
    Method: {
        type: "object"
    },
    Interface: INTERFACE_SCHEMA,
    Container: {
        type: "object",
        properties: {
            code: stringProperty("Код контейнера", { example: "OMS" }),
            name: stringProperty("Название контейнера", { example: "OrderService" }),
            description: stringProperty("Описание контейнера", { example: "Подробное описание" }),
            version: stringProperty("Версия контейнера", { example: "1.0.0" }),
            interfaces: {
                type: "array",
                items: schemasRef("Interface")
            }
        }
    },
    System: SYSTEM_SCHEMA,
    [SYSTEM_ASSESSMENT_RESULT_SCHEMA_NAME]: SYSTEM_ASSESSMENT_RESULT_SCHEMA
}

const SWAGGER = buildServiceSwagger(SYSTEM_SERVICE_NAME, SYSTEM_SERVICE_DESCRIPTION, CONTACT, API_VERSION, PATHS, { schemas: SCHEMAS, responses: { 400: BAD_REQUST_RESPONSE } })

export default SWAGGER;
*/