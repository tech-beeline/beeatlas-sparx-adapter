import { NotImplemented } from "../../utils/errors.mjs";
import express from 'express'
import { MaintenanceService } from "./service.mjs";

export class MaintenanceController {
    service = new MaintenanceService();
    constructor() {
        this.getMethodsDoubles = this.getMethodsDoubles.bind(this);
        this.deleteMethodDouble = this.deleteMethodDouble.bind(this);
    }
    async getMethodsDoubles(request, response) {
        response.json(await this.service.getMethodsDoubles());
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async deleteMethodDouble(request, response) {
        response.json(await this.service.deleteMethodDialogByUID(request.params.uid));
    }
}