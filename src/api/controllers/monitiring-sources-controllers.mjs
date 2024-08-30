import express from 'express'
import { BadRequest, NotFound, NotImplemented } from '../../utils/errors.mjs';
import service from '../services/monitiring-sources-service.mjs';

class GrafanaSourceControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getAll(request, response) {
        response.json(await service.getAllSources())
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async postSource(request, response) {
        response.json(await service.setSource(request.body))
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getSystemSource(request, response) {
        if (!request.params.code) throw BadRequest(`Parameter code is not specified`);
        response.json((await service.getSystemSource(request.params.code)) ?? {});
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async postSystemSource(request, response) {
        if (!request.params.code) throw BadRequest(`Parameter code is not specified`);
        response.json((await service.setSystemSource(request.params.code, request.body)) ?? {});
    }
}

export default new GrafanaSourceControllers();