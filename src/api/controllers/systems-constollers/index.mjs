import express from 'express'
import {
    SystemServiceInstance,
    GET_ALL_SYSTEMS_HANDLERS
} from '../../services/index.mjs';

import { BadRequest, NotFound, NotImplemented } from '../../../utils/errors.mjs';
import { logRequestDecorator } from '../log-request-decorator.mjs';

/**
 * 
 * @param {express.Request} request 
 */
function checkGetOptions(request) {
    if (request.query.level && !GET_ALL_SYSTEMS_HANDLERS[request.query.level]) {
        throw BadRequest(`Wrong level parameter value (${request.query.level})`);
    }
    if (request.query["add-removed"] && request.query["add-removed"] !== 'false' && request.query["add-removed"] != "true")
        throw BadRequest(`Wrong add-remove parameter value (${request.query["add-removed"]})`);
}


function validatePutSystemBody(system) {
    const containers = system.containers;
    if (containers) {
        if (!Array.isArray(containers)) throw BadRequest(`system.containers is not array`);
        for (const container of containers) {
            if (!container.code) throw BadRequest(`conatiner.code not specified\n${JSON.stringify({ ...container, interfaces: undefined })}`);
            if (container.interfaces) {
                if (!Array.isArray(container.interfaces)) throw BadRequest(`conatiner.interfaces is not array (container.code="${container.code}")`);
            }
        }
    }
}

export class SystemsControllers {
    /**
     *
     */
    constructor() {
        this.putSystem = logRequestDecorator(this.putSystem.bind(this));
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getAll(request, response) {
        checkGetOptions(request);

        response.json(await SystemServiceInstance.getAll(
            {
                level: request.query.level,
                addRemoved: request.query["add-removed"] === "true"
            }));
    }

    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getByCode(request, response) {
        checkGetOptions(request);
        if (!request.params.code) throw BadRequest('Parameter "code" is not specified')

        response.json(await SystemServiceInstance.getByCode(request.params.code,
            {
                level: request.query.level,
                addRemoved: request.query["add-removed"] === "true"
            }));
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async putSystem(request, response) {
        const system = request.body;
        validatePutSystemBody(system);
        const code = request.params.code;
        if (!code) throw BadRequest(`Parameter "code" is not specified`);

        response.json(await SystemServiceInstance.putSystem(code, system));
    }
    /**
    * 
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async getPurpose(request, response) {
        if (!request.params.code) throw BadRequest('The code is not specified');

        response.json(await SystemServiceInstance.getPurpose(request.params.code));
    }
    /**
   * 
   * @param {express.Request} request 
   * @param {express.Response} response 
   */
    async getE2EParticipition(request, response) {
        if (!request.params.code) throw BadRequest('The code is not specified');

        response.json(await SystemServiceInstance.getE2EParticipition(request.params.code));
    }

    /**
    * 
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async getSystemAssessments(request, response) {
        if (!request.params.code) throw BadRequest('The code is not specified');

        response.json(await SystemServiceInstance.getSystemAssessments(request.params.code));
    }

    /**
    * 
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async postSystemAssessment(request, response) {
        response.json(await SystemServiceInstance.addAssessmentStatus(request.params.code, request.body));
    }

    /**
    * 
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async getApiMonitoring(request, response) {
        response.json(await SystemServiceInstance.getApiMonitoring(request.params.code));
    }

    /**
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async postApiMonitoring(request, response) {
        if (!request.body.apiMetricTemplate && request.body.apiMetricTemplate !== "") throw BadRequest(`apiMetricTemplate not specified`);
        response.json(await SystemServiceInstance.setAppMonitoringTemplate(request.params.code, request.body.apiMetricTemplate));
    }

        /**
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async getProvidedApi(request, response){
        if (!request.params.code) throw BadRequest(`code is not specified`);
        response.json(await SystemServiceInstance.getProvidedApi(request.params.code));
    }
}

export default new SystemsControllers();