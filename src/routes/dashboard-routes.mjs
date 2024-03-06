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
        }
    }
}

export default DASHBOARD_METHODS;