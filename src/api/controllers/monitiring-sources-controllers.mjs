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

    async postObjectSource(request, response) {
        const body = request.body;
        if( !body.object_id) throw BadRequest('object_id is not specified');

        response.json((await service.setObjectMetricTemplate(request.body)) ?? {});
    }

    async postContainerSource(request, response) {
        const body = request.body;
        if( !body.container_code) throw BadRequest('container_code is not specified');
        
        response.json((await service.setContainerMetricTemplate(request.body)) ?? {});
    }

    async postInterfaceSource(request, response) {
        const body = request.body;
        if( !body.interfaceCode) throw BadRequest('interface_code is not specified');
        
        response.json((await service.setInterfaceMetricTemplate(request.body)) ?? {});
    }
}

export default new GrafanaSourceControllers();