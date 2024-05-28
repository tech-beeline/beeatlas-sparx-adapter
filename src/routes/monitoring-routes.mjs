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