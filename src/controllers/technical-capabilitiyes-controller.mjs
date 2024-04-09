import express from 'express'
import TechnicalCapabilityService from '../services/technical-capabilities-service.mjs'
import TechnicalCapability from '../model/technical-capability.mjs';

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
    /**
     * 
     * @param {express.Request} request 
     * @param {*} response 
     */
    async postTechnicalCapability(request, response) {
        try {
            /** @type { TechnicalCapability} */
            const capabiltity = request.body;
            if (!capabiltity.targetSystemCode) throw Object.assign(Error('Нужно задать код целевой системы'), { status: 400 });
            response.json(await TechnicalCapabilityService.postTechnicalCapability(capabiltity));

        } catch (error) {
            console.error(error)
            response.status(error.status ?? 500).send(error.message);
        }
    }
}

export default new TechnicalCapabilitiesController()