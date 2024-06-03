import monitoringService from "../services/monitoring-service.mjs";
import express from 'express'
import { NotImplemented, ProcessError } from "../utils/errors.mjs";
import YAML from 'yaml'

class MonitoringController {
    /**
     * 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {*} next 
     * @returns 
     */
    async getDashboardManifestForInterface(req, res, next) {
        try {
            res.contentType('application/yaml')
                .send(YAML.stringify(await monitoringService.getInterfaceDashboardManifest(req.params.code)));
        } catch (e) {
            ProcessError(e, res);
        }
    }
    async getSystemApiManifest( req,res,next){
        try {
            res.contentType('application/yaml')
                .send(YAML.stringify(await monitoringService.getSystemApiManifest(req.params.code)));
        } catch (e) {
            ProcessError(e, res);
        }
    }
    async getProcessDashboardManifest(req, res,next){
        try {
            res.contentType('application/yaml')
                .send(YAML.stringify(await monitoringService.getProcessDashboardManifest(req.params.code)));
        } catch (e) {
            ProcessError(e, res);
        }
    }
}

export default new MonitoringController();