import express from 'express'
import systemsService from '../services/systems-serivice/index.mjs';
import { BadRequest, NotFound, NotImplemented } from '../../utils/errors.mjs';
import { GET_ALL_HANDLERS } from '../services/systems-serivice/get-all-systems.mjs';

/**
 * 
 * @param {express.Request} request 
 */
function checkGetOptions(request) {
    if (request.query.level && !GET_ALL_HANDLERS[request.query.level]) {
        throw BadRequest(`Wrong level parameter value (${request.query.level})`);
    }
    if (request.query["add-removed"] && request.query["add-removed"] !== 'false' && request.query["add-removed"] != "true")
        throw BadRequest(`Wrong add-remove parameter value (${request.query["add-removed"]})`);
}

class SystemsControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getAll(request, response) {
        checkGetOptions(request);

        response.json(await systemsService.getAll(
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

        response.json(await systemsService.getByCode(request.params.code,
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
        const code = request.params.code;
        if (!code) throw BadRequest(`Parameter "code" is not specified`);

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