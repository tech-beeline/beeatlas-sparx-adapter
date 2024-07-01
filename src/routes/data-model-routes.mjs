import dataModelController from "../controllers/data-model-controller.mjs";

const DATA_MODEL_ROUTES = {
    tag: "Управление моделью данных",
    description: "Управление моделью данных",
    paths: {
        "/api/v1/data-model/glossaries": {
            get: {
                operation: dataModelController.getGlossaries,
                summary: "Список словарей",
                description: "",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": [
                                { id: "id", name: "Имя словаря"}
                            ]
                        }
                    }
                }
            }
        },
        "/api/v1/data-model/glossaryTerms": {
            get: {
                operation: dataModelController.getAllTerms,
                summary: "Список словарей",
                description: "",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": [
                                { id: "id", name: "Имя словаря"}
                            ]
                        }
                    }
                }
            }
        },
        "/api/v1/data-model/glossaries/{id}/terms": {
            get: {
                operation: dataModelController.getGlossaryTerms,
                summary: "Список словарей",
                description: "",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        description: "Идентификатор словаря",
                        "required": true,
                        examples: {
                            'Beeline TV': {
                                value: 'faf8fe66-a852-4030-81c7-5ef19604ab68'
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

export default DATA_MODEL_ROUTES;