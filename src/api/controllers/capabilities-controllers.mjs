import express from 'express'
import capabilitiesService from '../services/capabilities-service.mjs';
import { BadRequest, NotFound, NotImplemented } from '../../utils/errors.mjs';

class CapabilityControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getAll(request, response) {
        response.json(await capabilitiesService.getAll())
    }

    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getByCode(request, response) {
        if (!request.params.code) throw BadRequest(`The code is not specified`);
        const capabilty = await capabilitiesService.getByCode(request.params.code);
        if (!capabilty) throw NotFound(`The capability with the code ${request.params.code} was not found`)

        response.json(capabilty);
    }
}

export default new CapabilityControllers();