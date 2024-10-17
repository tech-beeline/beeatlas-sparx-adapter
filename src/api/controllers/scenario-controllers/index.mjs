import express from 'express'
import { BadRequest, NotImplemented } from '../../../utils/errors.mjs';
import { buildHREF } from '../controller-decorator.mjs';
import { ScenariosServiceInstance } from '../../services/index.mjs';
import { ScenarioCallTreeLink, ScenarioLink, ScenarioMessagesLink } from '../../specifications/paths.mjs';
import { ProcessScenario } from '../../model/index.mjs';


/**
 * 
 * @param {ProcessScenario} scenario 
 * @returns 
 */
const addScenarioLinks = (scenario) => {
    if (scenario) {
        scenario.links = {
            self: ScenarioLink(scenario.uid),
            messages: ScenarioMessagesLink(scenario.uid),
            callTree: ScenarioCallTreeLink(scenario.uid)
        }
    }
    return scenario;
}

export class ProcessScenarioControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getScenario(request, response, next) {
        if (!request.params.uid) throw BadRequest('Scenario uid is not specified');
        response.json(addScenarioLinks(await ScenariosServiceInstance.getgetScenarioMessagesByUID(request.params.uid)));
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getScenarioMessages(request, response, next) {
        if( !request.params.uid) throw BadRequest('uid parameter is not specified');
        
        response.json( await ScenariosServiceInstance.getScenarioMessages(request.params.uid))
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getScenarioCallTree(request, response, next) {
        NotImplemented();
    }
}