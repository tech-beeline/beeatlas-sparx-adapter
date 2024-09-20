import express from 'express';
import techRadarService from '../services/tech-radar-service/index.mjs';

class TechRadarControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     * @return {Promise}
     */
    async getCategories(request, response) {
        response.json(await techRadarService.getCategories());
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     * @return {Promise}
     */
    async getTechnologies(request, response) {
        response.json(await techRadarService.getTechologies());
    }

}

export default new TechRadarControllers();