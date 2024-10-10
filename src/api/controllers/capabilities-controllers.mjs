import express from 'express'
import capabilitiesService from '../services/capabilities-service.mjs';
import { BadRequest, NotFound, NotImplemented } from '../../utils/errors.mjs';

export class CapabilityControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getAll(request, response) {
        response.json(await capabilitiesService.getAll())
    }

    /**
     * Поиск возможности по имени
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async searchByName(request, response) {
        if (!request.query.terms || !request.query.terms.length) throw BadRequest(`Terms is not specified`);
        response.json(await capabilitiesService.searchByName(request.query.terms));
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