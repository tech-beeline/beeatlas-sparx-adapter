import express from 'express'
import service from '../services/tc-serivce.mjs';
import { BadRequest, NotFound, NotImplemented } from '../../utils/errors.mjs';

class TechnicalCapabilitiesControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getAll(request, response) {
        response.json( await service.getAll());
    }

    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getByCode(request, response) {
        NotImplemented();
    }
}

export default new TechnicalCapabilitiesControllers();