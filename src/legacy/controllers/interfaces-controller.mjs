import express from 'express'
import InterfacesService from '../services/interfaces-service.mjs';
import interfacesService from '../services/interfaces-service.mjs';

function processError(error, response) {
    console.error(error);
    if (error.status) {
        return response.status(error.status).json({ message: error.message });
    }
    return response.status(500).json({ message: error.message })
}


class InterfacesController {
    constructor() {
        this.getInterface = this.getInterface.bind(this);
    }
    /**
     * 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {*} next 
     */
    async getInterface(req, res, next) {
        try {
            res.json(await InterfacesService.getInterface(req.params.code));
        } catch (error) {
            processError(error, res);
        }
    }
    async getInterfaces(req, res, next) {
        try {
            throw Error('not implemented');
        } catch (error) {
            processError(error, res);
        }
    }
    async getMethods(req, res, next) {
        try {
            res.json(await interfacesService.getMethodsByInterfaceCode(req.params.code));
        } catch (error) {
            processError(error, res);
        }
    }
    /**
     * 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {*} next 
     */
    async putMethods(req, res, next) {
        try {
            res.json(await interfacesService.putMethods(req.params.code, req.body));
        } catch (error) {
            processError(error, res);
        }
    }
}

export default new InterfacesController();