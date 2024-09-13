import { API_VERSION, CONTACT } from "../../resources/const.mjs"
import { GetJSONOperation, SimpleServiceSpecification, arraySchema, booleanProperty, buildServiceSwagger, dateTimeProperty, pathParameter, schemasRef, stringProperty } from "./helpers.mjs"
import e2eControllers from '../controllers/e2e-process-controllers.mjs'
import { E2E_LIST_RESOURCE, E2E_RESOURCE } from "./paths.mjs"

export const PROCESS_SERVICE_NAME = "Управление информацией о Е2Е процессах"
export const PROCESS_SERVICE_DESCRIPTION = "Управление информацией о Е2Е процесса"


const GET_E2E_SUMMARY = 'Получение списка Е2Е процессов';

export const E2E_MESSAGES_RESOURCE = "/api/v4/e2e/{uid}/messages"
export const E2E_BI_RESOURCE = "/api/v4/e2e/{uid}/bi"
export const E2E_BI_MESSAGES_RESOURCE = "/api/v4/e2e-bi/{uid}/messages"
export const E2E_BI_SCENARIO_RESOURCE = "/api/v4/e2e-bi/{uid}/scenario"

const SWAGGER = new SimpleServiceSpecification(PROCESS_SERVICE_NAME,
    PROCESS_SERVICE_DESCRIPTION, API_VERSION, CONTACT
);
//#region Определение типов
const E2E_PROCESS_SCHEMA = SWAGGER.defineEntitySchema("E2EProcess", {
    type: "object",
    properties: {
        uid: stringProperty("Идентификатор Е2Е процесса", { example: "{5DE220EF-4CC4-4adb-AB5B-C49223DB7ED4}" }),
        name: stringProperty("Название Е2Е процесса", { example: "Я, как ..." }),
    }
});

const E2E_MESSAGE_SCHEMA = SWAGGER.defineEntitySchema("E2EProcessMessage", {
    type: "object",
    properties: {
        uid: stringProperty("Идентфиикатор сообщения"),
        name: stringProperty("Название сообщения")
    }
});

//#endregion

//#region Определение параметров
const PROCESS_UID_PARAMETER = pathParameter("uid", "Идентификатор Е2Е процесса", "{5DE220EF-4CC4-4adb-AB5B-C49223DB7ED4}");
//#endregion

//#region Определение методов
SWAGGER
    .defineGet(E2E_LIST_RESOURCE,
        new GetJSONOperation(GET_E2E_SUMMARY, null, arraySchema(E2E_PROCESS_SCHEMA))
            .setContoller(e2eControllers.getE2EList)
    ).defineGet(E2E_RESOURCE,
        new GetJSONOperation("Получение информаци о процессе по идентификатору",
            [PROCESS_UID_PARAMETER],
            E2E_PROCESS_SCHEMA)
            .setContoller(e2eControllers.getE2E));
//#endregion

export default SWAGGER;