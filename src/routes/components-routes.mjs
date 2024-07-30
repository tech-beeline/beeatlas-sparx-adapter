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
                    },
                    {
                        name: "loadMethods",
                        in: "query",
                        description: "Выгружать методы",
                        required: false,
                        examples: {
                            "Выгрузить методы": {
                                value: 0
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
                            "SYSTEM B": {
                                value: "CMDB_B"
                            }
                        }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            examples: {
                                "OK": SYSTEM_EXAMPLES.OTHER_SIMPLE_SAMPLE
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
        },
        "/api/v1/systems/{cmdb}/e2e-processes": {
            get: {
                operation: componentsController.getSystemProcesses,
                description: "Получение описания системы по коду",
                parameters: [
                    {
                        name: "cmdb",
                        in: "path",
                        description: "Код системы",
                        required: true,
                        examples: {
                            "RICH": {
                                value: "RICH"
                            }
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                            }
                        }
                    }
                }
            }
        }
    }
}

export default COMPONENTS_METHODS;