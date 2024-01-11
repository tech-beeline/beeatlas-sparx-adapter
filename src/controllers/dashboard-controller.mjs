import processDashboardService from "../services/process-dashboard-service.mjs";

class DashboardController {
    async getProcesses(request, response) {
        try {
            response.json( await processDashboardService.getProcessStatusRows());
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
}

export default new DashboardController()