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
        "/api/v1/e2e-process/systems" :{
            get:{
                summary : "Выгрузка информации по процесса",
                operation: e2eProcessController.getProcessSystems,
                responses:{
                    200: {
                        description : "OK",
                        content: {
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : {
                                
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