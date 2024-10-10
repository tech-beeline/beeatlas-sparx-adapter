import e2eProcessController from "../controllers/e2e-process-controller.mjs";

const E2EProcessRoutes = {
    tag: "Справочник процессов",
    description: "Получение информации о статусах Е2Е процессов",
    paths: {
        "/api/v1/e2e-processes": {
            get: {
                operation: e2eProcessController.getProcesses,
                summary: "Получение списка сквозных Е2Е процессов",
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
        "/api/v1/e2e-processes/{code}/business-interactions": {
            get: {
                operation: e2eProcessController.getProcessBusinessInteractions,
                summary: "Получение списка сквозных Е2Е процессов",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код процесса",
                        required: true,
                        examples: {
                            "Смена ТП в ЕЛК": {
                                value: "{AD0F73D8-87B1-41ed-AD5A-61DC188466D7}"
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
                                    "OK": []
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v3/e2e/messages/{uid}": {
            get: {
                operation: e2eProcessController.getMessageDetails,
                summary: "Получение списка сквозных Е2Е процессов",
                parameters: [
                    {
                        name: "uid",
                        in: "path",
                        description: "Идентификатор сообщения",
                        required: true,
                        examples: {
                            "PBE.ATTRACTION->ORDER MANAGEMENT PUT /basket": {
                                value: "{D532DC8D-09F7-42aa-8B18-B3F3B71E285C}"
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
                                    "OK": []
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v3/e2e/bi-scenarios/{code}": {
            get: {
                operation: e2eProcessController.getBusinessInteractionScenario,
                summary: "Получение списка сквозных Е2Е процессов",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код сценария",
                        required: true,
                        examples: {
                            "Инициирую подключение": {
                                value: "{F1A39AE9-CE2B-41eb-A57E-9B3A5F76F253}"
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
                                    "OK": []
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/e2e-processes/{code}": {
            get: {
                operation: e2eProcessController.getProcessSummary,
                summary: "Получение списка сквозных Е2Е процессов",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код процесса",
                        required: true,
                        examples: {
                            "Смена ТП в ЕЛК": {
                                value: "{AD0F73D8-87B1-41ed-AD5A-61DC188466D7}"
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
                                    "OK": []
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/v1/e2e-process/systems": {
            get: {
                summary: "Выгрузка информации по процесса",
                operation: e2eProcessController.getProcessSystems,
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {

                            }
                        }
                    }
                }
            }
        },
        "/api/v1/e2e-process-messages/{code}": {
            get: {
                operation: e2eProcessController.getProcessMessages,
                summary: "Получение иерарххии взаимодействий",
                description: "Получение иерарххии взаимодействий для выбранного Е2Е процесса",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код процесса",
                        required: true,
                        examples: {
                            "Смена ТП в ЕЛК": {
                                value: "{AD0F73D8-87B1-41ed-AD5A-61DC188466D7}"
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

export default E2EProcessRoutes;