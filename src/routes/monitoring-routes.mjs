import monitoringController from "../controllers/monitoring-controller.mjs";

const INTERFACES_ROUTES = {
    tag: "Управление манифестами платформы наблюдаемости",
    description: "Создание манифестов для подключения API к платформе наблюдаемости",
    paths: {
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
        "/api/v1/process/{code}/monitoring/api" : {
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
        }
    }
}

export default INTERFACES_ROUTES;