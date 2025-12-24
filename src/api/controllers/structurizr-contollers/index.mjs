import express from 'express'
import { StructurizrService } from "../../services/index.mjs";
import { BadRequest, NotImplemented } from '../../../utils/errors.mjs';

export class StructurizrControllers {
    /** @type {StructurizrService} */
    service;
    constructor(service = new StructurizrService()) {
        this.service = service;
        this.getJsonCheckResult = this.getJsonCheckResult.bind(this);
        this.getProduct = this.getProduct.bind(this);
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getJsonCheckResult(request, response) {
        const workspaceId = request.params.id;
        if (!workspaceId) throw BadRequest(`parameter id is not psecified`);
        response.json(await this.service.getJsonCheckResult(workspaceId));
    }
    
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getProduct(request, response) {
        response.json(await this.service.getProduct(request.params.code));
    }
};
