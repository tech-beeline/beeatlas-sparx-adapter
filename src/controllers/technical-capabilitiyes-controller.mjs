import TechnicalCapabilityService from '../services/technical-capabilities-service.mjs'

class TechnicalCapabilitiesController {
    async getTechnicalCapabilities(request, response) {
        try {
            response.json(await TechnicalCapabilityService.getTechnicalCapabilities());
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
    async getTechnicalCapability(request, response) {
        try {
            response.json(await TechnicalCapabilityService.getTechnicalCapability({ code: request.params.code }));
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
}

export default new TechnicalCapabilitiesController()