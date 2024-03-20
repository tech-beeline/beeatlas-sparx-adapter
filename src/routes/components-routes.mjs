import componentsController from "../controllers/components-controller.mjs";
import COMPONENTS_EXAMPLES from "../swagger/examples/components-examples.mjs";
import SYSTEM_EXAMPLES from "../swagger/examples/system-examples.mjs";


const COMPONENTS_METHODS = {
    tag: "Управление компонентами",
    description: "Управление компонентами",
    paths: {
        "/api/components": {
            get: {
                operation: componentsController.getComponents,
                summary: "Получение списка компонентов",
                description: "Получение списка компонентов",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                examples: {
                                    "OK": [
                                        COMPONENTS_EXAMPLES.SimpleComponent,
                                        COMPONENTS_EXAMPLES.BACKENDISHOP]
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/systems": {
            get: {
                operation: componentsController.getSystemList,
                description: "Получение списка систем",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                examples: {
                                    "OK": SYSTEM_EXAMPLES.LIST_SAMPLE
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/systems/{code}": {
            get: {
                operation: componentsController.getSystem,
                description: "Получение описания системы по коду",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код системы",
                        required: true,
                        examples: {
                            "SYSTEM A": {
                                value: "CMDB_A"
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
                                    "OK": SYSTEM_EXAMPLES.SIMPLE_SYSTEM
                                }
                            }
                        }
                    }
                }
            },
            put: {
                operation: componentsController.putSystem,
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код системы",
                        required: true,
                        examples: {
                            "SYSTEM A": {
                                value: "CMDB_A"
                            }
                        }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            examples: {
                                "OK": SYSTEM_EXAMPLES.SIMPLE_SYSTEM
                            }
                        }
                    }
                },
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

export default COMPONENTS_METHODS;