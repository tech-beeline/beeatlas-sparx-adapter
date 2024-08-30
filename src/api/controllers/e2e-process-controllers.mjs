import express from 'express'
import service from '../services/e2e-process-service.mjs';
import { BadRequest, NotImplemented } from '../../utils/errors.mjs';

class E2EProcessControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getE2EList(reques, response) {
        return response.json(await service.getE2EList());
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getE2E(request, response) {
        if (!request.params.uid) throw BadRequest('Process uid is not specified');
        return response.json(await service.getE2E(request.params.uid));
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getE2EBusinessInteractions(request, response) {
        if (!request.params.uid) throw BadRequest('Process uid is not specified');
        response.json(await service.getE2EBusinessInteractions(request.params.uid))
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getE2EMessages(request, response) {
        response.json(await service.getE2EMessages(request.params.uid));
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getBIScenario(request, response) {
        NotImplemented()
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getBIMessages(request, response) {
        NotImplemented()
    }
}

export default new E2EProcessControllers();