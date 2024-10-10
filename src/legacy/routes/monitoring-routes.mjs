import monitoringController from "../controllers/monitoring-controller.mjs";

const INTERFACES_ROUTES = {
    tag: "Управление манифестами платформы наблюдаемости",
    description: "Создание манифестов для подключения API к платформе наблюдаемости",
    paths: {
        "/api/v2/dashboards/scenarios/{code}": {
            get: {
                operation: monitoringController.getScenarioJSON,
                summary: "Получение JSON для формирования дашборда для E2E сценария",
                description: "",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код продукта",
                        "required": true,
                        examples: {
                            '2.1.1 Я как мобильный клиент хочу открыть ЕЛК для управления подключенными и доступными услугами': {
                                value: '{74276CF2-9C3D-419e-A8F8-EB39A7A68FC0}'
                            }
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/yaml": {
                            }
                        }
                    }
                }
            }
        },
        "/api/v2/dashboards/systems/{code}": {
            get: {
                operation: monitoringController.getSystemJSON,
                summary: "Получение JSON для формирования дашборда для системы",
                description: "",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код продукта",
                        "required": true,
                        examples: {
                            'Тестовая система': {
                                value: 'CMDB_B'
                            }
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/yaml": {
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/systems/{code}/monitoring/api": {
            get: {
                operation: monitoringController.getSystemApiManifest,
                summary: "полчение манифеста для создания дашборда API",
                description: "",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код продукта",
                        "required": true,
                        examples: {
                            'Витрина ФДМ': {
                                value: 'FDMSHOWCASEAPP'
                            }
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/yaml": {
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/process/{code}/monitoring/api": {
            get: {
                operation: monitoringController.getProcessDashboardManifest,
                summary: "полчение манифеста для создания дашборда E2E процесса",
                description: "",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код процесса (uid)",
                        "required": true,
                        examples: {
                            'тестовый процесс': {
                                value: '{03D0D6E1-2527-41f1-908F-496DAE3877EF}'
                            }
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/yaml": {
                            }
                        }
                    }
                }
            }
        },
        "/api/v3/monitoring/bi/publish" :{
            post: {
                operation: monitoringController.publishBIDashboard,
                summary: "2.1.1 Я как мобильный клиент хочу открыть ЕЛК для управления подключенными и доступными услугами",
                description: "",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            examples: {
                                "Витрина ФДМ": {
                                    code: "{74276CF2-9C3D-419e-A8F8-EB39A7A68FC0}"
                                }
                            }
                        }
                    }
                },
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
        },
        "/api/v3/monitoring/system/publish": {
            post: {
                operation: monitoringController.publishSystemDashboard,
                summary: "Создание дашборда на платформе наблюдаемости для системы",
                description: "",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            examples: {
                                "Витрина ФДМ": {
                                    cmdb: "FDMSHOWCASEAPP"
                                }
                            }
                        }
                    }
                },
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

export default INTERFACES_ROUTES;