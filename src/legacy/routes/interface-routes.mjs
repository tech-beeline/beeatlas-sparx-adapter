import interfacesController from "../controllers/interfaces-controller.mjs";
import { APIMethod } from "../../api/model/system.mjs";

const INTERFACES_ROUTES = {
    tag: "Управление Интерфейсами",
    description: "Управление описанием интерфейсов",
    paths: {
        "/api/v1/interfaces/{code}": {
            get: {
                operation: interfacesController.getInterface,
                summary: "Получение Описания интерфейса по коду",
                description: "",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код интерфейса",
                        "required": true,
                        examples: {
                            'Тестовый интерфейс': {
                                value: 'IMYAPI.CONTAINER.CMDB_A'
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
        },
        "/api/v1/interfaces/{code}/methods": {
            get: {
                operation: interfacesController.getMethods,
                summary: "Получение описание методов для интерфейса",
                description: "",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код интерфейса",
                        "required": true,
                        examples: {
                            'Тестовый интерфейс': {
                                value: 'IMYAPI.CONTAINER.CMDB_A'
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
            },
            put: {
                operation: interfacesController.putMethods,
                summary: "Обновление описания методов для интерфейса",
                description: "",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код интерфейса",
                        "required": true,
                        examples: {
                            'Тестовый интерфейс': {
                                value: 'IMYAPI.CONTAINER.CMDB_A'
                            }
                        }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            examples: {
                                "OK": [
                                    new APIMethod({
                                        "name": "GET api/v1/interfaces/new",
                                        "returnType": "void"
                                    }),
                                    new APIMethod({
                                        "name": "GET api/v1/interfaces",
                                        "returnType": "void"
                                    }),
                                    new APIMethod({
                                        "name": "GET api/v1/inteerfaces/{code}",
                                        "parameters": [
                                            {
                                                "name": "code",
                                                "type": "string"
                                            }
                                        ]
                                    }),
                                ]
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
        "/api/v1/interfaces": {
            get: {
                operation: interfacesController.getInterfaces,
                summary: "полчение списка интерфейсов",
                description: "",
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