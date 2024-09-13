import express from 'express'
import systemsService from '../services/systems-service.mjs';
import { BadRequest, NotFound, NotImplemented } from '../../utils/errors.mjs';


function checkGetOptions(request) {
    if (request.query.excludeContainers && request.query.excludeContainers !== "true" && request.query.excludeContainers !== "false") {
        throw BadRequest(`Invalid excludeContainers parameter value ${request.query.excludeContainers}. The value must be of the boolean type`)
    }
}
class SystemsControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getAll(request, response) {
        checkGetOptions(request);

        response.json(await systemsService.getAll({ excludeContainers: request.query.excludeContainers === "true" }));
    }

    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getByCode(request, response) {
        checkGetOptions(request);
        if (!request.params.code) throw BadRequest('Parameter "code" is not specified')

        response.json(await systemsService.getByCode(request.params.code, { excludeContainers: request.query.excludeContainers === "true" }));
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async putSystem(request, response) {
        const system = request.body;
        const code = request.params.code;
        if( !code) throw BadRequest(`Parameter "code" is not specified`);

        response.json(await systemsService.putSystem(code, system));
    }
    /**
    * 
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async getPurpose(request, response) {
        if (!request.params.code) throw BadRequest('The code is not specified');

        response.json(await systemsService.getPurpose(request.params.code));
    }
    /**
   * 
   * @param {express.Request} request 
   * @param {express.Response} response 
   */
    async getE2EParticipition(request, response) {
        if (!request.params.code) throw BadRequest('The code is not specified');

        response.json(await systemsService.getE2EParticipition(request.params.code));
    }

    /**
    * 
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async getSystemAssessments(request, response) {
        if (!request.params.code) throw BadRequest('The code is not specified');

        response.json(await systemsService.getSystemAssessments(request.params.code));
    }

    /**
    * 
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async postSystemAssessment(request, response) {
        response.json(await systemsService.addAssessmentStatus(request.params.code, request.body));
    }
}

export default new SystemsControllers();