import express from 'express'
import { BadRequest, NotImplemented } from '../../../utils/errors.mjs';
import { ObservabilityServiceInstance } from '../../services/index.mjs';

export class ObservabilityControllers {
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
}

export default new ObservabilityControllers();