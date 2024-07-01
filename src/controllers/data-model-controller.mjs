import monitoringService from "../services/monitoring-service.mjs";
import express from 'express'
import { NotImplemented, ProcessError } from "../utils/errors.mjs";
import YAML from 'yaml'
import dataModelService from "../services/data-model-service.mjs";

class DataModelController {
    /**
     * 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {*} next 
     * @returns 
     */
    async getGlossaries(req, res, next) {
        try {
            res.json(await dataModelService.getGlossaries());
        } catch (e) {
            ProcessError(e, res);
        }
    }
    /**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {*} next 
 * @returns 
 */
    async getGlossaryTerms(req, res, next) {
        try {
            res.json(await dataModelService.getGlossaryTerms(req.params.id));
        } catch (e) {
            ProcessError(e, res);
        }
    }

    async getAllTerms(req, res, next) {
        try {
            res.json(await dataModelService.getAllTerms(req.params.id));
        } catch (e) {
            ProcessError(e, res);
        }
    }
}

export default new DataModelController();