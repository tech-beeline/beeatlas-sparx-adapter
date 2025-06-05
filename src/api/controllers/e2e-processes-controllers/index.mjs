import express from 'express'
import { E2EProcessesServiceInstance as e2eService } from '../../services/index.mjs';
import { BadRequest, NotImplemented } from '../../../utils/errors.mjs';
import { buildHREF } from '../controller-decorator.mjs';
import { E2E_LIST_RESOURCE, E2ELink } from '../../specifications/paths.mjs';


const addProcessLinks = (p) => p.links = {
    self: E2ELink(p.uid),
    scenarios: buildHREF(`${E2E_LIST_RESOURCE}/${encodeURIComponent(p.uid)}/scenarios`)
};
export class E2EProcessControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getE2EList(reques, response) {
        const e2eList = await e2eService.getE2EList();
        e2eList.forEach(addProcessLinks)
        return response.json(e2eList);
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getE2E(request, response) {
        if (!request.params.uid) throw BadRequest('Process uid is not specified');
        return response.json(await e2eService.getE2E(request.params.uid));
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getE2EScenarios(request, response) {
        if (!request.params.uid) throw BadRequest('Process uid is not specified');
        response.json(await e2eService.getE2EScenarios(request.params.uid))
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getE2EMessages(request, response) {
        response.json(await e2eService.getE2EMessages(request.params.uid));
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
        if( !request.params.uid)
            throw BadRequest(`Не задан UID для сценария`);
        console.log(`Получение сообщения для сценария uid=${request.params.uid}`);
        response.json(await e2eService.getBIMessages(request.params.uid));
    }
}

export default new E2EProcessControllers();