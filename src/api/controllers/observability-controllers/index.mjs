import express from 'express'
import { BadRequest, NotImplemented } from '../../../utils/errors.mjs';
import { ObservabilityServiceInstance } from '../../services/index.mjs';

export class ObservabilityControllers {
    /**
    * 
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async getScenarioDashboard(request, response) {
        if (!request.params.uid) throw BadRequest("Не указан uid сценария");
        response.json(await ObservabilityServiceInstance.getScenarioDashboard(request.params.uid));
    }
    /**
         * 
         * @param {express.Request} request 
         * @param {express.Response} response 
         */
    async publishScenarioDashboard(request, response) {
        const body = request.body;
        if (!body?.uid) throw BadRequest("Invalid request body");
        console.info("Publish scenario dashboard", body);
        const result = await ObservabilityServiceInstance.publishScenarioDashboard(body.uid);
        response.json({ message: "Витрина сценария создана" });
    }

    /**
    * 
    * @param {express.Request} request 
    * @param {express.Response} response 
    */
    async publishApplicationDashboard(request, response) {
        const options = request.body;
        if (!options.systemCode) throw BadRequest(`systemCode is not specified`);
        response.json(await ObservabilityServiceInstance.publishApplicationDashboard(options.systemCode));
    }

}

export default new ObservabilityControllers();