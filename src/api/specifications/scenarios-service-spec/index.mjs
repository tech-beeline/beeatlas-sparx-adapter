import { ProcessScenarioControllersInstance as controllers } from "../../controllers/index.mjs";
import { arraySchema, GetJSONOperation, pathParameter, SimpleServiceSpecification } from "../helpers.mjs";
import { SCENARIO_MESSAGES_RESOURCE, SCENARIO_RESOURCE } from "../paths.mjs";
import { SCENARIO_SCHEMA } from "./scnearios-service-chemas.mjs";

const SCENARIOS_SERVICE_NAME = "Сервис управление информацией о сценариях процессов";
const SCENARIOS_SERVICE_DESCRIPTION = "Управление информацией о сценариях процессов"

const GET_SCENARIO_SUMMARY = "Получение информации о сценарии";
const GET_SCENARIO_MESSAGE_SUMMARY = "Получение информации вызовах и сообщениях между участниками в сценарии";

const SCENARIOS_SERVICE_SWAGGER = new SimpleServiceSpecification(SCENARIOS_SERVICE_NAME, SCENARIOS_SERVICE_DESCRIPTION);
const PROCESS_SCNARIO_SCHEMA_REF = SCENARIOS_SERVICE_SWAGGER.defineEntitySchema("ProcessScenario", SCENARIO_SCHEMA)


const SCENARIO_UID_PARAMETER = pathParameter("uid", "Идентификатор сценария", "{F1A39AE9-CE2B-41eb-A57E-9B3A5F76F253}");

SCENARIOS_SERVICE_SWAGGER
    .defineGet(
        SCENARIO_RESOURCE,
        new GetJSONOperation(
            GET_SCENARIO_SUMMARY,
            [SCENARIO_UID_PARAMETER],
            arraySchema(PROCESS_SCNARIO_SCHEMA_REF),
            controllers.getScenario))
    .defineGet(
        SCENARIO_MESSAGES_RESOURCE,
        new GetJSONOperation(
            GET_SCENARIO_MESSAGE_SUMMARY,
            [SCENARIO_UID_PARAMETER],
            arraySchema({ type: "object" }),
            controllers.getScenarioMessages
        ));

export default SCENARIOS_SERVICE_SWAGGER;