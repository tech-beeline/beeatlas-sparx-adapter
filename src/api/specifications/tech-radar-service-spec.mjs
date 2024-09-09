import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { booleanProperty, buildServiceSwagger, dateTimeProperty, integerProperty, schemasRef, stringProperty } from "./helpers.mjs"

export const TECH_RADAR_SERVICE_NAME = "Управление информацией о технологиях"
export const TECH_RADAR_SERVICE_DESCRIPTION = "Управление информацией о технологиях, используемых в компании"

export const TECH_RADAR_CATEGORY_LIST_RESOURCE = '/api/v4/tech-radar/categories';
export const TECH_RADAR_TECHNOLOGY_LIST_RESOURCE = '/api/v4/tech-radar/technologies';

export const GET_ALL_CATEGORY_SPEC = {
    tags: [TECH_RADAR_SERVICE_NAME],
    summary: "Получение списка технологических категорий",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: schemasRef('TechCategory')
                    }
                }
            }
        }
    }
}

export const GET_ALL_TECHNOLOGY_SPEC = {
    tags: [TECH_RADAR_SERVICE_NAME],
    summary: "Получение списка технологий",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: {
                        type: "array",
                        items: schemasRef('Technology')
                    }
                }
            }
        }
    }
}

const PATHS = {
    [TECH_RADAR_CATEGORY_LIST_RESOURCE]: {
        get: GET_ALL_CATEGORY_SPEC
    },
    [TECH_RADAR_TECHNOLOGY_LIST_RESOURCE]: {
        get: GET_ALL_TECHNOLOGY_SPEC
    }
}

const SCHEMAS = {
    TechCategory: {
        type: "object",
        properties: {
            id: integerProperty("Идентификатор категории"),
            name: stringProperty("Название технологической категории", { example: "Инфраструктура" })
        }
    },
    Technology: {
        type: "object",
        properties: {
            id: integerProperty("Идентификатор технологии"),
            category: schemasRef('TechCategory'),
            createdDate: dateTimeProperty("Дата регистрации технологии"),
            deletedDate: dateTimeProperty("Дата удаления технологии из тех. радара")
        }
    }
}

const SWAGGER = buildServiceSwagger(TECH_RADAR_SERVICE_NAME, TECH_RADAR_SERVICE_DESCRIPTION, CONTACT, API_VERSION, PATHS, { schemas: SCHEMAS })

export default SWAGGER;