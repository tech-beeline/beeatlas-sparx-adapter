import express from 'express'
import tcService from '../services/tc-serivce.mjs';
import { BadRequest, NotFound, NotImplemented } from '../../utils/errors.mjs';

class TechnicalCapabilitiesControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getAll(request, response) {
        response.json(await tcService.getAll());
    }

    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getByCode(request, response) {
        if (!request.params.code) throw BadRequest('Code is not specified');
        response.json(await tcService.getByCode(request.params.code));
    }
}

export default new TechnicalCapabilitiesControllers();