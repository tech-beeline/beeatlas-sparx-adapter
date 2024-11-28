import express from 'express'
import { TCServiceInstance as tcService } from '../../services/index.mjs';
import { BadRequest, NotFound, NotImplemented } from '../../../utils/errors.mjs';

export class TechnicalCapabilitiesControllers {
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
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async putTC(request, response) {
        console.info(`start putTC (code="${request.params.code}")`)
        console.log(request.body);
        if (!request.params.code) throw BadRequest('Code is not specified');

        request.body.code = request.params.code;
        const result = await tcService.putTC(request.body);
        console.info('putTC result:')
        console.info(result);
        response.json(result);
    }
}