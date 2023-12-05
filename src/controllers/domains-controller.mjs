import express from "express";
import capabilitiesService from "../services/capabilities-service.mjs";
import DomainsService, { DomainAlreadyExistException } from "../services/domains-service.mjs";
import { formatHREF } from "../utils/href.mjs"
import { capabilityDTO } from "./capabilities-controller.mjs";

/**
 * 
 * @param {Express.Request} request 
 * @param {{
*  createdDate: Date
* }} domain 
* @returns 
*/
function domainTDO(request, domain) {
    return {
        code: domain.code,
        href: formatHREF(request, `/api/domains/${domain.code}`),
        name: domain.name,
        description: domain.description,
        createdDate: domain.createdDate,
        modifiedDate: domain.modifiedDate,
        author: domain.author,
        status: domain.status,
        parent: domain.parentAlias ? {
            code: domain.parentAlias,
            href: formatHREF(request, `/api/domains/${domain.parentAlias}`)
        } : {}
    };
}

class DomainsController {
    async getDomains(request, response) {
        try {
            response.json((await DomainsService.getDomains())
                .map(d => domainTDO(request, d)));
        } catch (err) {
            console.log(err);
            response.status(500).send(err.message);
        }
    }
    async getDomainByCode(request, response) {
        try {
            let domain = await DomainsService.getDomainByCode(request.params.code);
            if (!domain) {
                return response.status(404).send(`domain with code ${request.params.code} not found`);
            }
            response.json(domainTDO(request, domain));
        } catch (err) {
            response.status(500).send(err.message);
        }
    }
    async getSubdomains(request, response) {
        try {
            response.json((await DomainsService.getSubdomains(request.params.code)).map(d => domainTDO(request, d)));
        } catch (err) {
            response.status(500).send(err.message);
        }
    }
    async getDomainCapabilities(request, response) {
        try {
            response.json((await capabilitiesService.getCapabilityByDomainCode(request.params.code)).map(c => capabilityDTO(request, c)));
        } catch (err) {
            response.status(500).send(err.message);
        }
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {*} response 
     */
    async createDomain(request, response) {
        try {
            response.json(await DomainsService.createDomain(request.body));
            //throw Error('not implemented');
        } catch (error) {
            if (error instanceof DomainAlreadyExistException) {
                return response.status(409).send(`Domain ${request.body.code} already exists`);
            }
            console.error(error);
            response.status(500).send(error.message);
        }
    }
}

export default new DomainsController();