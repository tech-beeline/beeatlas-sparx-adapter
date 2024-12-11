import telemetryController from "../controllers/telemetry-controller.mjs";

const INTERFACES_ROUTES = {
    tag: "Телеметрия",
    description: "Создание манифестов для подключения API к платформе наблюдаемости",
    paths: {
        "/api/v1/telemetry/c4plugin/start": {
            post: {
                operation: telemetryController.postC4Plugin,
                summary: "Регистрация факта запуска плагина для vs code",
                description: "",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            examples: {
                                "OK": { version: "1.0.0", action: "start", user: "FDM USER", template_id: "template_id" }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "text/plain": {
                                examples: {
                                    "OK": "OK"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export default INTERFACES_ROUTES;