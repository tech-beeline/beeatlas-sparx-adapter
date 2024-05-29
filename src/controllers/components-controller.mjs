import componentsService from "../services/components-service.mjs";

function processError(error, response) {
    console.error(error);
    if (!error) return response.status(500);

    if (error.status) {
        return response.status(error.status).json({ message: error.message });
    }
    return response.status(500).json({ message: error.message })
}

class ComponentsController {
    async getComponents(request, response) {
        try {
            response.json(await componentsService.getComponents());
        } catch (error) {
            processError(error, response);
        }
    }
    async getSystemList(request, response) {
        try {
            response.json(await componentsService.getSystemList())
        } catch (error) {
            processError(error, response);
        }
    }
    async getSystem(request, response) {
        try {
            response.status(200).json(await componentsService.getSystem(request.params.code));
        } catch (error) {
            processError(error);
        }
    }
    async putSystem(request, response) {
        try {
            return response.json(await componentsService.putSystem(request.params.code, request.body));
        } catch (error) {
            processError(error, response);
        }
    }
}

export default new ComponentsController();