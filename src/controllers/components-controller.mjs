import componentsService from "../services/components-service.mjs";


class ComponentsController {
    async getComponents(request, response) {
        try {
            response.json(await componentsService.getComponents());
        } catch (error) {
            response.status(500).send(err.message);
        }
    }
}

export default new ComponentsController();