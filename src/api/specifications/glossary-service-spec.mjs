import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import glossaryControllers from "../controllers/glossary-controllers.mjs";
import { booleanProperty, buildServiceSwagger, dateTimeProperty, schemasRef, stringProperty } from "./helpers.mjs"

export const BUSINESS_TERMS_SERVICE_NAME = "Управление информацией о бизнес-терминах"
export const BUSINESS_TERMS_SERVICE_DESCRIPTION = `
Управление информацией бизнес-терминах`

export const GLOSSARY_LIST_RESOURCE_V4 = '/api/v4/glossaries';
export const GLOSSARY_RESOURCE_V4 = '/api/v4/glossaries/{id}';
export const GLOSSARY_TERM_LIST_RESOURCE_V4 = '/api/v4/glossaries/{id}/terms';
export const TERM_LIST_RESOURCE_V4 = '/api/v4/glossary-terms';
export const TERM_RESOURCE_V4 = '/api/v4/glossary-terms/{id}';

export const GLOSSARY_SCHEMA = {
    type: "object",
    properties: {
        id: stringProperty("Идентификатор словаря", { example: "e9a387e2-04b3-4da5-9efc-f670e5af2a08" }),
        type: stringProperty("Тип словаря", { example: "glossary" }),
        name: stringProperty("Название словаря", { example: "Self care" }),
        fullyQualifiedName: stringProperty("Полное название", { example: "fullyQualifiedName" }),
        description: stringProperty("Описание словаря"),
        deleted: booleanProperty("Признак, что словарь удален"),
        self: stringProperty("Ссылка на словарь", { example: `https://company${GLOSSARY_LIST_RESOURCE_V4}/e9a387e2-04b3-4da5-9efc-f670e5af2a08` })
    }
};

const GLOSSARY_SCHEMA_REF = schemasRef('Glossary')

const TERM_SCHEMA = {
    tyupe: "object",
    properties: {
        id: stringProperty("Идентификатор бизнес термина", { example: "c050e67f-392c-437c-a921-63d350d256cf" }),
        name: stringProperty("Термин"),
        displayName: stringProperty("Отображаемое имя термина"),
        fullyQualifiedName: stringProperty("Полное квалифицированное название тремина"),
        synonyms: {
            type: "array",
            items: {
                type: "string"
            }
        },
        description: stringProperty("Описание термина")
    }
}
const TERM_REF = schemasRef("Term");

const GET_GLOSSARY_LIST_SPEC = {
    tags: [BUSINESS_TERMS_SERVICE_NAME],
    summary: "Получение списка бизнес-словарей",
    description: "Получение списка бизнес словарей",
    controller: glossaryControllers.getGlossaryList,
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: GLOSSARY_SCHEMA_REF
                    }
                }
            }
        }
    }
}

const GET_GLOSSARY_SPEC = {
    tags: [BUSINESS_TERMS_SERVICE_NAME],
    summary: "Получение информации о бизнес-словаре",
    description: "Получение информации о бизнес-словаре",
    controller: glossaryControllers.getGlossary,
    parameters: [
        {
            name: "id",
            in: "path",
            description: "Идентификатор словаря",
            required: true,
            example: "faf8fe66-a852-4030-81c7-5ef19604ab68"
        }
    ],
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GLOSSARY_SCHEMA_REF
                }
            }
        }
    }
}

const GET_GLOSSARY_TERMS_SPEC = {
    tags: [BUSINESS_TERMS_SERVICE_NAME],
    summary: "Получение списка терминов для словаря",
    parameters: [
        {
            name: "id",
            in: "path",
            description: "Идентификатор словаря",
            required: true,
            example: "faf8fe66-a852-4030-81c7-5ef19604ab68"
        }
    ],
    controller: glossaryControllers.getGlossaryTerms,
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: TERM_REF
                    }
                }
            }
        }
    }
}

const PATHS = {
    [GLOSSARY_LIST_RESOURCE_V4]: {
        get: GET_GLOSSARY_LIST_SPEC
    },
    [GLOSSARY_RESOURCE_V4]: {
        get: GET_GLOSSARY_SPEC
    },
    [GLOSSARY_TERM_LIST_RESOURCE_V4]: {
        get: GET_GLOSSARY_TERMS_SPEC
    }
}


const SCHEMAS = {
    Glossary: GLOSSARY_SCHEMA,
    Term: TERM_SCHEMA
}

const SWAGGER = buildServiceSwagger(BUSINESS_TERMS_SERVICE_NAME, BUSINESS_TERMS_SERVICE_DESCRIPTION, CONTACT, API_VERSION, PATHS, { schemas: SCHEMAS })

export default SWAGGER;