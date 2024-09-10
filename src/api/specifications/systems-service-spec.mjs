import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { BAD_REQUST_RESPONSE, booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"
import { CAPABILITY_SCHEMA } from "./capabilities-service-spec.mjs";
import { TC_SCHEMA } from "./tc-service-spec.mjs";
import { INTERFACE_SCHEMA } from "./interfaces-service-spec.mjs";
import { SYSTEM_ASSESSMENT_RESOURCE, SYSTEM_LIST_RESOURCE } from "./paths.mjs";
import { SYSTEM_ASSESSMENT_RESULT_SCHEMA, SYSTEM_ASSESSMENT_RESULT_SCHEMA_NAME, SYSTEM_ASSESSMENT_RESULT_SCHEMA_REF } from "../model/system.mjs";
import systemsControllers from "../controllers/systems-controllers.mjs";

export const SYSTEM_SERVICE_NAME = "Управление информацией о системах"
export const SYSTEM_SERVICE_DESCRIPTION = "Поиск, получение и изменение информации о системе"


export const SYSTEM_RESOURCE = '/api/v4/systems/{code}';
export const SYSTEM_PURPOSE_RESOURCE = '/api/v4/systems/{code}/purpose';
export const SYSTEM_E2E_RESOURCE = '/api/v4/systems/{code}/e2e';

const SYSTEM_SCHEMA = {
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
            items: schemasRef('Container')
        }
    }
};


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


const GET_CAPABILITIES = {
    tags: [SYSTEM_SERVICE_NAME],
    summary: "Список бизнес и технических возможностей, в реализации которых участвует система",
    controller : systemsControllers.getPurpose,
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
                        items: schemasRef('SystemPurpose')
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