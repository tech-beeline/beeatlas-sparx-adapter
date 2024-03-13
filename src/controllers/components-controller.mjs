import componentsService from "../services/components-service.mjs";


class ComponentsController {
    async getComponents(request, response) {
        try {
            response.json(await componentsService.getComponents());
        } catch (error) {
            response.status(500).send(error.message);
        }
    }
    async getSystemList(request, response) {
        try {
            throw Error('not imlemented');
        } catch (error) {
            response.status(500).send(error.message);
        }
    }
    async getSystem(request, response) {
        try {
            response.json(await componentsService.getSystem(request.params.code));
        } catch (error) {
            console.error(error);
            response.status(500).send(error.message);
        }
    }
    async putSystem(request, response) {
        try {
            response.json( await componentsService.putSystem( request.params.code, request.body));
        } catch (error) {
            console.error( error);
            response.status(500).send(error.message);
        }
    }
}

export default new ComponentsController();