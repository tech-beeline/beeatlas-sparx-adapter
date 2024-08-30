import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { BAD_REQUST_RESPONSE, booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"
import { CAPABILITY_SCHEMA } from "./capabilities-swagger.mjs";
import { TC_SCHEMA } from "./tc-swagger.mjs";

export const BC_NAME = "Управление информацией о системах"
export const BC_DESCRIPTION = "Поиск, получение и изменение информации о системе"
export const SYSTEM_LIST_RESOURCE = '/api/v4/systems';
export const SYSTEM_RESOURCE = '/api/v4/systems/{code}';
export const SYSTEM_PURPOSE_RESOURCE = '/api/v4/systems/{code}/purpose';
export const SYSTEM_E2E_RESOURCE = '/api/v4/systems/{code}/e2e';

export const GET_ALL_SPEC = {
    tags: [BC_NAME],
    summary: "Получение списка систем",
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
    tags: [BC_NAME],
    summary: "Получение информации о системе",
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
    tags: [BC_NAME],
    summary: "Обновление информации о системе и ее API",
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
    tags: [BC_NAME],
    summary: "Список бизнес и технических возможностей, в реализации которых участвует система",
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
    tags: [BC_NAME],
    summary: "Список е2е процессов, в котороых участвует система",
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
    Interface: {
        type: "object",
        properties: {
            code: stringProperty("код интерфейса", { example: "GATEWAY" }),
            name: stringProperty("Имя интерфейса", { example: "OMS REST API" }),
            description: stringProperty("Описание интерфейса", { example: "Подробно о" }),
            version: stringProperty("Версия интерфейса", { example: "1.0.0" }),
            //type:stringProperty("Имя интерфейса", { example: "OMS REST API" }),
            api_url: stringProperty("Ссылка на спецификацию", { example: "https://company/swagger/oms.yaml" }),
            capabilityCode: stringProperty("Код технической возможности, которую реализует интерфейс", { example: "FDMSHOWCASE.001" }),
            protocol: stringProperty("Протокол для подключнию к интерфейсу", { example: "REST" }),
            methods: { type: "array", items: schemasRef("Method") }
        }
    },
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
    System: {
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
    }
}

const SWAGGER = buildServiceSwagger(BC_NAME, BC_DESCRIPTION, CONTACT, API_VERSION, PATHS, { schemas: SCHEMAS, responses: { 400: BAD_REQUST_RESPONSE } })

export default SWAGGER;