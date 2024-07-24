import slaController from "../controllers/sla-controller.mjs"

const SLA_ROUTES = {
    tag: "Управление SLA ",
    description: "Создание манифестов для подключения API к платформе наблюдаемости",
    paths: {
        "/api/v3/sla/interactions/{uid}": {
            post: {
                operation: slaController.postInteractionSLA,
                summary: "Изхменение SLA для взаимодействия",
                parameters: [
                    {
                        name: "uid",
                        in: "path",
                        description: "GUID взаимодействия",
                        "required": true,
                        examples: {
                            'GET /constructor/connected(char, char, String, String)': {
                                value: '{C0B5EF33-4ED5-4368-9B68-A8B285AA0EAA}'
                            }
                        }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            examples: {
                                "SLA": { rps: 80, latency: 0.3, errorRate: 90 }
                            }
                        }
                    }
                },
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

export default SLA_ROUTES