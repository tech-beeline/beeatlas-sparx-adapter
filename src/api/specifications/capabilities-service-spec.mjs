import controllers from "../controllers/capabilities-controllers.mjs";
import { GetJSONOperation, JSONOperation, SimpleServiceSpecification, arraySchema, booleanProperty, buildServiceSwagger, dateTimeProperty, pathParameter, queryParameter, schemasRef, stringProperty } from "./helpers.mjs"
import { CAPABILITY_LIST_RESOURCE, CAPABILITY_LIST_RESOURCE_V4, CAPABILITY_RESOURCE, CAPABILITY_RESOURCE_V4, CAPABILITY_SEARCH_RESOURCE } from "./paths.mjs";

export const CAPABILITY_SERVICE_NAME = "Управление бизнес-возможностями"
export const CAPABILITY_SERVICE_DESCRIPTION = "Управление возможностями и доменами"

const SWAGGER = new SimpleServiceSpecification(CAPABILITY_SERVICE_NAME, CAPABILITY_SERVICE_DESCRIPTION);

//#region Определение сущностей

export const BC_LINK_SCHEMA = {
    type: "object",
    properties: {
        code: stringProperty("Код бизнес-возможности", { example: "DMN.153" }),
        name: stringProperty("Название бизнес-возможности", { example: "Проектирование технического решения ИТ-продукта" }),
        href: stringProperty("Ссылка на бизнес-возможность", { example: `http://company${CAPABILITY_LIST_RESOURCE_V4}/DMN.153` })
    }
}

export const CAPABILITY_SCHEMA = {
    type: "object",
    description: "Информация о бизнес-возможности",
    properties: {
        code: stringProperty("Код бизнес-возможности", { example: "BC-018364" }),
        isDomain: booleanProperty("Признак домена. true - Домен или группа, false -  возможность"),
        name: stringProperty("Название бизнес-возможности", { example: "Высокоуровневое проектирование продукта" }),
        description: stringProperty("Описание бизнес-возможности"),
        author: stringProperty("Кто создал", { example: "Иванов Петр" }),
        status: stringProperty("Статус бизнес-возможности", { example: "Черновик" }),
        createdDate: dateTimeProperty("Дата создания"),
        modifieddDate: dateTimeProperty("Дата последнего изменения"),
        parent: { description: "Родительская бизнес-воможность", ...BC_LINK_SCHEMA },
        children: {
            type: "array",
            items: {
                type: "object"
            },
            description: "Дочерние бизнес-возможности"
        },
        self: stringProperty("Ссылка на бизнес-возможность", { example: `http://company${CAPABILITY_LIST_RESOURCE}/BC-018364` })
    }
};
const CAPABILITY_SCHEMA_REF = SWAGGER.defineEntitySchema("Capability", CAPABILITY_SCHEMA);
//#endregion

//#region параметры запросов
const CAPABILITY_CODE_PARAMETER = pathParameter("code", "Код бизнес возможности", "GRP.001")
const SEARCH_TERMS_PARAMETER = queryParameter("terms", "Строка поиска", false, "процесс")
//#endregion

SWAGGER
    .defineGet(CAPABILITY_SEARCH_RESOURCE,
        new GetJSONOperation("Поиск бизнес-возможности по имени", [SEARCH_TERMS_PARAMETER], arraySchema(CAPABILITY_SCHEMA_REF))
            .setContoller(controllers.searchByName))
    .defineGet(CAPABILITY_LIST_RESOURCE,
        new GetJSONOperation("Получение списка бизнес-возможностей", null, arraySchema(CAPABILITY_SCHEMA_REF))
            .setContoller(controllers.getAll))
    .definePost(CAPABILITY_LIST_RESOURCE,
        new JSONOperation("Регистрация новой бизнес возможности", null, CAPABILITY_SCHEMA_REF, CAPABILITY_SCHEMA_REF))
    .defineGet(CAPABILITY_RESOURCE,
        new GetJSONOperation("Получение описания бизнес-возможности по коду",
            [CAPABILITY_CODE_PARAMETER]
            , CAPABILITY_SCHEMA_REF)
            .setContoller(controllers.getByCode)
    )
    .definePut(CAPABILITY_RESOURCE,
        new JSONOperation("Получение описания бизнес-возможности по коду",
            [CAPABILITY_CODE_PARAMETER],
            CAPABILITY_SCHEMA_REF
            , CAPABILITY_SCHEMA_REF)
    );

export default SWAGGER;