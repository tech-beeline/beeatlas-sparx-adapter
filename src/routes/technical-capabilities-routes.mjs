import TechnicalCapabilitiesController from "../controllers/technical-capabilitiyes-controller.mjs";
import TechnicalCapability from "../model/technical-capability.mjs";

const TC_METHODS = {
    tag: "Управление техническими возможностями",
    description: "Управление техническими возможностями",
    paths: {
        "/api/tech-capabilities": {
            get: {
                operation: TechnicalCapabilitiesController.getTechnicalCapabilities,
                summary: "Получение списка технических возможностей",
                description: "Получение списка технических возможностей",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                examples: {
                                    "OK": []
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export default TC_METHODS;