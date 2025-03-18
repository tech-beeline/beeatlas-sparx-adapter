import { API_VERSION, CONTACT, STRUCTURIZR_JSON_CHECK_RESOURCE } from "../../../resources/const.mjs";
import { StructurizrControllers } from "../../controllers/index.mjs";

const TITLE = "Сервис управления информацией из structirizr";
const DESCRIPTION = "Проверка и получение инофрмации из structirizr on premise";
const JSON_CHECK_TAG = "Проверка workspace.json";
const JSON_CHECK_DESCRIPTION = "Проверка workspace.json";

const controllers = new StructurizrControllers();

export const STRUCTURIZR_JSON_CHECK_SPEC = {
    openapi: "3.0.3",
    info: {
        title: TITLE,
        description: DESCRIPTION,
        version: API_VERSION,
        contact: CONTACT
    },
    tags: [
        {
            name: JSON_CHECK_TAG,
            description: JSON_CHECK_DESCRIPTION
        }
    ],
    paths: {
        [STRUCTURIZR_JSON_CHECK_RESOURCE]: {
            get: {
                summary: JSON_CHECK_DESCRIPTION,
                tags: [JSON_CHECK_TAG],
                controller: controllers.getJsonCheckResult,
                parameters: [
                    {
                        name: "id", in: "path", description: "Идентификатор workspace в structurize on premise", required: true,
                        example: "36932"
                    }
                ],
                responses: {
                    "200": {
                        description: "OK",
                        content: {
                            "applciation/json": {
                                schema: {
                                    $ref: "#/components/schemas/JsonCheckResult"
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            JsonCheckResult: {
                type: "object",
                properties: {

                }
            }
        }
    }
}