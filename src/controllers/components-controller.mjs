import componentsService from "../services/components-service.mjs";

function processError(error, response) {
    console.error(error);
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
            processError(error);
        }
    }
    async getSystemList(request, response) {
        try {
            throw Error('not imlemented');
        } catch (error) {
            processError(error);
        }
    }
    async getSystem(request, response) {
        try {
            response.json(await componentsService.getSystem(request.params.code));
        } catch (error) {
            processError(error);
        }
    }
    async putSystem(request, response) {
        try {
            response.json(await componentsService.putSystem(request.params.code, request.body));
        } catch (error) {
            processError(error);
        }
    }
}

export default new ComponentsController();