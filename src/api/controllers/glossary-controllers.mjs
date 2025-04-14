import express from 'express'
import { BadRequest, NotFound, NotImplemented } from '../../utils/errors.mjs'
import glossaryService from '../services/glossary-service.mjs';

export class GlossaryControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     * 
     */
    async getGlossaryList(request, response) {
        response.json(await glossaryService.getGlossaryList());
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     * 
     */
    async getGlossary(request, response) {
        if (!request.params.id) {
            throw BadRequest(`Parameter id is not specified`);
        }
        const glossary = await glossaryService.getGlossary(request.params.id);
        if (!glossary) {
            throw NotFound(`Glossary with id=${request.params.id} not found`)
        }
        response.json(glossary);
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     * 
     */
    async getGlossaryTerms(request, response) {
        if (!request.params.id) {
            throw BadRequest(`Parameter id is not specified`);
        }
        response.json(await glossaryService.getGlossaryTerms(request.params.id));
    }
    
    async getDatabaseServices(request, response){
        response.json( await glossaryService.getDatabaseServices());
    }
}

//export default new GlossaryControllers();