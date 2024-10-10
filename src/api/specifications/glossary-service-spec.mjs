import { GlossaryControllersInstance } from "../controllers/index.mjs";
import { GetJSONOperation, SimpleServiceSpecification, arraySchema, booleanProperty, buildServiceSwagger, dateTimeProperty, pathParameter, schemasRef, stringProperty } from "./helpers.mjs"
import { GLOSSARY_LIST_RESOURCE, GLOSSARY_RESOURCE, GLOSSARY_TERM_LIST_RESOURCE, TERM_RESOURCE } from "./paths.mjs";

export const BUSINESS_TERMS_SERVICE_NAME = "Управление информацией о бизнес-терминах"
export const BUSINESS_TERMS_SERVICE_DESCRIPTION = `Управление информацией бизнес-терминах`


const SWAGGER = new SimpleServiceSpecification(BUSINESS_TERMS_SERVICE_NAME, BUSINESS_TERMS_SERVICE_DESCRIPTION);

//#region Определение сущностей

const TERM_SCHEMA = SWAGGER.defineEntitySchema("Term", {
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
})

const GLOSSARY_SCHEMA = SWAGGER.defineEntitySchema("Glossary", {
    type: "object",
    properties: {
        id: stringProperty("Идентификатор словаря", { example: "e9a387e2-04b3-4da5-9efc-f670e5af2a08" }),
        type: stringProperty("Тип словаря", { example: "glossary" }),
        name: stringProperty("Название словаря", { example: "Self care" }),
        fullyQualifiedName: stringProperty("Полное название", { example: "fullyQualifiedName" }),
        description: stringProperty("Описание словаря"),
        deleted: booleanProperty("Признак, что словарь удален"),
        self: stringProperty("Ссылка на словарь", { example: `https://company${GLOSSARY_LIST_RESOURCE}/e9a387e2-04b3-4da5-9efc-f670e5af2a08` })
    }
});

//#endregion

//#region Определение операций
const GLOSSARY_ID_PARAMETER = pathParameter("id", "Идентификатор словаря", "faf8fe66-a852-4030-81c7-5ef19604ab68")
const TERM_ID_PARAMETER = pathParameter("id", "Идентификатор бизнес-термина", "f5cc3848-119c-4d71-bb19-a60edce1d0df")

SWAGGER.defineGet(GLOSSARY_LIST_RESOURCE,
    new GetJSONOperation("Получение списка словарей бизнес-терминов", null, arraySchema(GLOSSARY_SCHEMA))
        .setContoller(GlossaryControllersInstance.getGlossaryList)
);

SWAGGER.defineGet(GLOSSARY_RESOURCE,
    new GetJSONOperation("Получение информации о бизнес-словаре", [GLOSSARY_ID_PARAMETER], GLOSSARY_SCHEMA)
        .setContoller(GlossaryControllersInstance.getGlossary)
);

SWAGGER.defineGet(GLOSSARY_TERM_LIST_RESOURCE,
    new GetJSONOperation("Получение списка терминов для словаря", [GLOSSARY_ID_PARAMETER], arraySchema(TERM_SCHEMA))
        .setContoller(GlossaryControllersInstance.getGlossaryTerms)
);

SWAGGER.defineGet(TERM_RESOURCE,
    new GetJSONOperation("Получение описания термина", [TERM_ID_PARAMETER], arraySchema(TERM_SCHEMA))
);

//#endregion

export default SWAGGER;