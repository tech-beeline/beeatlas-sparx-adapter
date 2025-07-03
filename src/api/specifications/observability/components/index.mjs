import { arraySchema, numberProperty, stringProperty, SwaggerComponents } from "../../helpers.mjs";


export const ObservabilityComponents = new SwaggerComponents();


export const PUBLISH_APPLICATION_OPIONS_SCHEMA = {
    type: "object",
    properties: {
        systemCode: stringProperty("Код приложения", { example: "FDMSHOWCASEAPP" })
    }
};

export const PUBLISH_APPLICATION_RESULT_SCHEMA = {
    type: "object",
    properties: {
        systemCode: stringProperty("Код приложения", { example: "FDMSHOWCASEAPP" }),
        dashboardPath: stringProperty("Путь к созданному или обновленному дашборду", { example: "https://inside.beeline.ru/d/<asddddsa>" })
    }
};


export const PUBLISH_REQUEST_BODY_SCHEMA = {
    type: "object",
    properties: {
        uid: stringProperty("Идентификатор сценария", { example: "{301D7D9A-8FE8-45e1-BA58-4EE98EA173A9}" })
    }
}

export const SEQUENCE_METHOD_SCHEMA_REF = ObservabilityComponents.addSchema(
    "SequenceCallMethodDTO",
    {
        type: "object",
        properties: {
            name: stringProperty("Имя метода"),
            description: stringProperty("Описание метода"),
        }
    });

export const SEQUENCE_API_SCHEMA_REF = ObservabilityComponents.addSchema(
    "SequenceCallApiDTO",
    {
        type: "object",
        properties: {
            app_code: stringProperty("Код при приложения"),
            container_code: stringProperty("Код контейнера"),
            interface_code: stringProperty("Код интерфейса")
        }
    });

export const SEQUENCE_CALL_SCHEMA_REF = ObservabilityComponents.addSchema(
    "SequenceCallDTO",
    {
        type: "object",
        properties: {
            api: SEQUENCE_API_SCHEMA_REF,
            method: SEQUENCE_METHOD_SCHEMA_REF,
            description: stringProperty("Описание вызова"),
            sequence: arraySchema({ type: "object" })
        }
    });

export const SEQUENCE_SCHEMA_REF = ObservabilityComponents.addSchema(
    "ScenarioSequenceDTO",
    {
        type: "object",
        properties: {
            code: stringProperty("Код последовательности", "my_sequence"),
            name: stringProperty("Название последовательности"),
            sequence: arraySchema(SEQUENCE_CALL_SCHEMA_REF)
        }
    });
