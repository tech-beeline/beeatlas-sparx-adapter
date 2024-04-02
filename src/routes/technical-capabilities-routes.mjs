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
        },
        "/api/tech-capabilities/{code}": {
            get: {
                operation: TechnicalCapabilitiesController.getTechnicalCapability,
                summary: "Получение списка технических возможностей",
                description: "Получение списка технических возможностей",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "CMDB мнемоника технической возможности",
                        "required": true,
                        examples: {
                            'Поддержка сессии потребления и ее квотирование и тарификация(онлайн тарификация)': {
                                value: 'BC-013404'
                            }
                        }
                    }
                ],
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