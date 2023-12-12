import express from "express";
import capabilitiesService from "../services/capabilities-service.mjs";
import DomainsService, { DomainAlreadyExistException, DomainNotFoundException as DomainNotFoundException } from "../services/domains-service.mjs";
import { formatHREF } from "../utils/href.mjs"
import { capabilityDTO } from "./capabilities-controller.mjs";
import { OSLCException } from "../utils/oslc.mjs";



class ValidationException extends Error {
    status = 400;
    constructor(message) {
        super(message);
    }
}
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
            if (!request.params.code)
                response.status(400).json({ message: "Отсутстует code" });

            let domain = await DomainsService.getDomainByCode(request.params.code);
            if (!domain) {
                return response.status(404).send({ message: `domain with code ${request.params.code} not found` });
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
     * @param {Express.Request} request 
     * @returns 
     */
    validateCreateDomainRequest(request) {
        if (!request.body || request.body == "")
            throw new ValidationException("Отсутстует тело сообщения");
        if (Array.isArray(request.body)) {
            throw new ValidationException("Тело сообщение не должно быть массивом");
        }
        if (!request.body.code) {
            throw new ValidationException("Отстсвует код создаваемого домена (domain.code)");
        }

        if (!request.body.code.startsWith("GRP.") && !request.body.code.startsWith("DMN.")) {
            throw new ValidationException("Код домена должен быть вида GRP.* или DMN.*");
        }

        if (!request.body.name) {
            throw new ValidationException("Отстсвует имя создаваемого домена (domain.name)");
        }
    }
    /**
     * 
     * @param {express.Request} request 
     * @param {*} response 
     */
    async createDomain(request, response) {
        try {
            validateCreateDomainRequest(request)

            response.json(domainTDO(request, await DomainsService.createDomain(request.body)));
            //throw Error('not implemented');
        } catch (error) {
            if (error instanceof DomainAlreadyExistException) {
                return response.status(409).json({ message: `Domain ${request.body.code} already exists` });
            }
            if (error.status) {
                return response.status(error.status).json({ message: errormessage });
            }
            console.error(error);
            response.status(500).send(error.message);
        }
    }
    async createSubDomain(request, response) {
        try {
            validateCreateDomainRequest(request);
            let domainDTO = request.body;
            domainDTO.parent = { code: request.params.code };
            DomainsService.createDomain()
        } catch (error) {
            console.error(error);
            if (error instanceof DomainNotFoundException) {
                return response.status(error.status).send(error.message);
            }
            if (error instanceof OSLCException) {
                return response.status(error.status).send(error.message);
            }
            if (error.status) {
                return response.status(error.status).json({ message: errormessage });
            }
            response.status(500).send(error.message);
        }
    }
    async updateDomain(request, response) {
        try {
            let domainDTO = await request.body;
            response.json(domainTDO(request, await DomainsService.updateDomain(request.params.code, domainDTO)));
        } catch (error) {
            console.error(error);
            if (error instanceof DomainNotFoundException) {
                return response.status(error.status).send(error.message);
            }
            if (error instanceof OSLCException) {
                return response.status(error.status).send(error.message);
            }
            response.status(500).send(error.message);
        }
    }
}

export default new DomainsController();