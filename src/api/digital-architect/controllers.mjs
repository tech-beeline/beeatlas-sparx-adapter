import express from 'express'

import { DigitalArchitectService } from './service.mjs'
import { BadRequest } from '../../utils/errors.mjs';

export class DigitalArchitectControllers {
    /** @type {DigitalArchitectService} */
    service;
    constructor(service) {
        this.service = service ?? (new DigitalArchitectService());
        this.getUsers = this.getUsers.bind(this);
        this.getUserActions = this.getUserActions.bind(this);
    }

    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getUsers(request, response) {
        response.json(await this.service.getUsers());
    }

    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getUserActions(request, response) {
        if (!request.params.login)
            throw BadRequest('login не задан');

        response.json(await this.service.getUserActionByLogin(request.params.login));
    }
}