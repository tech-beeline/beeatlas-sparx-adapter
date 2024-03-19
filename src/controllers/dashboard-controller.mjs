import processDashboardService from "../services/process-dashboard-service.mjs";

class DashboardController {
    async getProcesses(request, response) {
        try {
            response.json(await processDashboardService.getProcessStatusRows());
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
    async getProcessInteractions(request, response) {
        try {
            response.json(await processDashboardService.getProcessInteractions(request.params.code));
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
    async getProcessScenario(request, response) {
        try {
            response.json(await processDashboardService.getProcessScenario(request.params.code));
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
    async getE2EFillingStatus(request, response) {
        try {
            response.json((await processDashboardService.getE2EFillingStatus()).map(a => Object.assign(a, { href: `/${a.uid}/details` })));
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
    async getE2EFillingDetails(request, response) {
        try {
            response.json(await processDashboardService.getE2EFillingDetails(request.params.code));
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
    async getDiagramInfo(request, response) {
        try {
            response.json(await processDashboardService.getDiagramInfo(request.params.code));
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
    async getE2EDiagramComponentStatus(request, response) {
        try {
            response.json(await processDashboardService.getDiagramComponentStatus(request.params.code));
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
    async getE2EDiagramMessagesStatus(request, response) {
        try {
            response.json(await processDashboardService.getDiagramMessagesStatus(request.params.code));
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
}

export default new DashboardController()