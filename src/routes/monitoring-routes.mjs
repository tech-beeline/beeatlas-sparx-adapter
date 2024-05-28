import monitoringController from "../controllers/monitoring-controller.mjs";

const INTERFACES_ROUTES = {
    tag: "Управление манифестами платформы наблюдаемости",
    description: "Создание манифестов для подключения API к платформе наблюдаемости",
    paths: {
        "/api/v1/monitoring/dashboards/interfaces/{code}": {
            get: {
                operation: monitoringController.getDashboardManifestForInterface,
                summary: "полчение манифеста для создания дашборда API",
                description: "",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код интерфейса",
                        "required": true,
                        examples: {
                            'Интерфейс API digital-contract-edo-service': {
                                value: 'digital-contract-edo-service-interface.digital-contract-edo-service.DCO'
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

export default INTERFACES_ROUTES;