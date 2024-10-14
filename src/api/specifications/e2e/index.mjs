import { API_VERSION, CONTACT } from "../../../resources/const.mjs"
import { GetJSONOperation, SimpleServiceSpecification, arraySchema, booleanProperty, buildServiceSwagger, dateTimeProperty, pathParameter, schemasRef, stringProperty } from "../helpers.mjs"
import e2eControllers from '../../controllers/e2e-processes-controllers/index.mjs'
import { E2E_LIST_RESOURCE, E2E_RESOURCE, E2E_SCENARIO_LIST_RESOURCE } from "../paths.mjs"
import { E2E_PROCESS_SCHEMA } from "./e2e-schema.mjs"
import { SCENARIO_SCHEMA } from "../scenarios-service-spec/scnearios-service-chemas.mjs"

export const PROCESS_SERVICE_NAME = "Управление информацией о Е2Е процессах"
export const PROCESS_SERVICE_DESCRIPTION = "Управление информацией о Е2Е процесса"

const GET_E2E_SUMMARY = 'Получение списка Е2Е процессов';
const GET_E2E_SCNARIOS_SUMMARY = 'Получение описания сценариев, участвующих в процессе';

export const E2E_MESSAGES_RESOURCE = "/api/v4/e2e/{uid}/messages"
export const E2E_BI_RESOURCE = "/api/v4/e2e/{uid}/bi"
export const E2E_BI_MESSAGES_RESOURCE = "/api/v4/e2e-bi/{uid}/messages"
export const E2E_BI_SCENARIO_RESOURCE = "/api/v4/e2e-bi/{uid}/scenario"

const E2E_SWAGGER = new SimpleServiceSpecification(
    PROCESS_SERVICE_NAME,
    PROCESS_SERVICE_DESCRIPTION,
    API_VERSION,
    CONTACT
);


//#endregion

//#region Определение параметров
const PROCESS_UID_PARAMETER = pathParameter("uid", "Идентификатор Е2Е процесса", "{5DE220EF-4CC4-4adb-AB5B-C49223DB7ED4}");
//#endregion

const E2E_PROCESS_SCHEMA_REF = E2E_SWAGGER.defineEntitySchema("E2EProcess", E2E_PROCESS_SCHEMA)
const PROCESS_SCENARIO_SCHEMA_REF = E2E_SWAGGER.defineEntitySchema("ProcessScenario", SCENARIO_SCHEMA)
//#region Определение методов
E2E_SWAGGER
    .defineGet(E2E_LIST_RESOURCE,
        new GetJSONOperation(GET_E2E_SUMMARY, null, arraySchema(E2E_PROCESS_SCHEMA_REF))
            .setContoller(e2eControllers.getE2EList)
    ).defineGet(E2E_RESOURCE,
        new GetJSONOperation("Получение информаци о процессе по идентификатору",
            [PROCESS_UID_PARAMETER],
            E2E_PROCESS_SCHEMA_REF)
            .setContoller(e2eControllers.getE2E))
    .defineGet(
        E2E_SCENARIO_LIST_RESOURCE,
        new GetJSONOperation(GET_E2E_SCNARIOS_SUMMARY,
            [PROCESS_UID_PARAMETER],
            arraySchema(PROCESS_SCENARIO_SCHEMA_REF),
            e2eControllers.getE2EScenarios
        ));
//#endregion

export default E2E_SWAGGER;