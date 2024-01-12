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
        }
    }
}

export default DASHBOARD_METHODS;