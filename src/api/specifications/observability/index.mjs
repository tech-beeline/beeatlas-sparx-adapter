import { API_VERSION, CONTACT } from "../../../resources/const.mjs"
import { ObservabilityControllersInstance } from "../../controllers/index.mjs";
import { GetJSONOperation, JSONOperation, SimpleServiceSpecification, arraySchema, booleanProperty, buildServiceSwagger, dateTimeProperty, pathParameter, schemasRef, stringProperty } from "../helpers.mjs"
import { OBSERVABILITY_E2E_SCENARIOS_PATH, OBSERVABILITY_E2E_SCENARIOS_RESOURCE_V4 } from "../paths.mjs";
import { PUBLISH_APPLICATION_OPIONS_SCHEMA, PUBLISH_APPLICATION_RESULT_SCHEMA } from "./components/index.mjs";
import { PUBLISH_APPLICATION_RESOURCE } from "./paths.mjs";


export const OBSERVABILITY_SERVICE_NAME = "Управление наблюдаемостью";
export const OBSERVABILITY_SERVICE_DESCRIPTION = "Управление наблюдаемостью";


const OBSERVABILITY_SWAGGER = new SimpleServiceSpecification(
    OBSERVABILITY_SERVICE_NAME,
    OBSERVABILITY_SERVICE_DESCRIPTION,
    API_VERSION,
    CONTACT
);

const SCENARIO_PUBLISH_SUMMARY = "Создание/обновление витрины для сценария";


const PUBLISH_REQUEST_BODY_SCHEMA = {
    type: "object",
    properties: {
        uid: stringProperty("Идентификатор сценария", { example: "{301D7D9A-8FE8-45e1-BA58-4EE98EA173A9}" })
    }
}

const PUBLISH_RESPONSE_BODY_SCHEMA = {

}
const SCENARIO_UID_PARAMETER = pathParameter("uid", "Идентификатор сценария", "{74276CF2-9C3D-419e-A8F8-EB39A7A68FC0}")


OBSERVABILITY_SWAGGER
    .defineGet(OBSERVABILITY_E2E_SCENARIOS_RESOURCE_V4, new GetJSONOperation(
        "Получение информации о дашброде наблюадемости в графане", [SCENARIO_UID_PARAMETER], {}, ObservabilityControllersInstance.getScenarioDashboard
    )).definePost(OBSERVABILITY_E2E_SCENARIOS_PATH,
        new JSONOperation(
            SCENARIO_PUBLISH_SUMMARY, [], PUBLISH_REQUEST_BODY_SCHEMA, PUBLISH_RESPONSE_BODY_SCHEMA,
            ObservabilityControllersInstance.publishScenarioDashboard
        )
    ).definePost(PUBLISH_APPLICATION_RESOURCE, new JSONOperation(
        "Создание или обновление дашборда системы", [], PUBLISH_APPLICATION_OPIONS_SCHEMA,
        PUBLISH_APPLICATION_RESULT_SCHEMA, ObservabilityControllersInstance.publishApplicationDashboard
    ));

export default OBSERVABILITY_SWAGGER;