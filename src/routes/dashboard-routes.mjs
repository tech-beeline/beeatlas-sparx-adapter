import dashboardController from "../controllers/dashboard-controller.mjs";

const DASHBOARD_METHODS = {
    tag: "Справочник процессов",
    description: "Получение информации о статусах Е2Е процессов",
    paths: {
        "/api/process-status": {
            get: {
                operation: dashboardController.getProcesses,
                summary: "Получение статусов по процессам",
                description: "Получение списка технических возможностей",
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
        "/api/process/{code}/interactions": {
            get: {
                operation: dashboardController.getProcessInteractions,
                summary: "Получение взаимодействий в сценариях",
                description: "Получение информации о ",
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
        ,
        "/api/process/{code}/scenario": {
            get: {
                operation: dashboardController.getProcessScenario,
                summary: "Получение взаимодействий в сценариях",
                description: "Получение информации о ",
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
        "/api/process-filling": {
            get: {
                operation: dashboardController.getE2EFillingStatus,
                summary: "Получение информации о статусе заполнение",
                description: "Получение информации о том, на сколько описание Е2Е процесса завершено",
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
        "/api/process-filling/{code}/details": {
            get: {
                operation: dashboardController.getE2EFillingDetails,
                summary: "Получение информации о статусе заполнение",
                description: "Получение детальной информации о том, на сколько описание Е2Е процесса завершено",
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
        "/api/process-component-status/{code}": {
            get: {
                operation: dashboardController.getE2EDiagramComponentStatus,
                summary: "Получение информации о статусе заполнение компонентов на диаграмме",
                description: "Получение детальной информации о том, на сколько описание Е2Е процесса завершено",
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
        "/api/process-messages-status/{code}": {
            get: {
                operation: dashboardController.getE2EDiagramMessagesStatus,
                summary: "Получение информации о статусе заполнение вызовов на диаграмме",
                description: "Получение информации о статусе заполнение вызовов на диаграмме",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код процесса",
                        required: true,
                        examples: {
                            "Открытие страницы на сайте": {
                                value: "{74276CF2-9C3D-419e-A8F8-EB39A7A68FC0}"
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
        "/api/diagram/{code}": {
            get: {
                operation: dashboardController.getDiagramInfo,
                summary: "Получение информации о статусе заполнение компонентов на диаграмме",
                description: "Получение детальной информации о том, на сколько описание Е2Е процесса завершено",
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
    }
}

export default DASHBOARD_METHODS;