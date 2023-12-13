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
    constructor() {
        this.validateCreateDomainRequest = this.validateCreateDomainRequest.bind(this);
        this.createSubDomain = this.createSubDomain.bind(this);
        this.createDomain = this.createDomain.bind(this);
        this.processException = this.processException.bind(this);
        this.updateDomain = this.updateDomain.bind(this);
        this.deleteDomain = this.deleteDomain.bind(this);
        this.createDomainCapability = this.createDomainCapability.bind(this);
    }
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
    processException(error, response) {
        console.error(error);

        if (error instanceof DomainAlreadyExistException) {
            return response.status(409).json({ message: error.message });
        }
        if (error.status) {
            return response.status(error.status).json({ message: error.message });
        }
        if (error instanceof DomainNotFoundException) {
            return response.status(error.status).send(error.message);
        }
        if (error instanceof OSLCException) {
            return response.status(error.status).send(error.message);
        }

        response.status(500).send(error.message);

    }
    /**
     * 
     * @param {express.Request} request 
     * @param {*} response 
     */
    async createDomain(request, response) {
        try {
            this.validateCreateDomainRequest(request)

            response.json(domainTDO(request, await DomainsService.createDomain(request.body)));
            //throw Error('not implemented');
        } catch (error) {
            this.processException(error, response);
        }
    }
    async createSubDomain(request, response) {
        try {
            this.validateCreateDomainRequest(request);
            let new_domain = request.body;
            new_domain.parent = { code: request.params.code };
            return response.json(domainTDO(await DomainsService.createDomain(new_domain)));
        } catch (error) {
            this.processException(error, response)
        }
    }
    async updateDomain(request, response) {
        try {
            let domainDTO = await request.body;
            response.json(domainTDO(request, await DomainsService.updateDomain(request.params.code, domainDTO)));
        } catch (error) {
            this.processException(error, response)
        }
    }
    async deleteDomain(request, response) {
        try {
            if (!request.params.code) {
                response.status(400).json({ message: "Параметр [code] не указан" });
            }
            await DomainsService.deleteDomain(request.params.code);
            response.status(200).send();
        } catch (error) {
            this.processException(error, response);
        }
    }

    async createDomainCapability(request, response) {
        try {
            if (!request.params.code) {
                response.status(400).json({ message: "Параметр [code] не указан" });
            }
            response.json(capabilityDTO(request, await capabilitiesService.createCapability({ ...request.body, domain: { code: request.params.code } })));
        } catch (error) {
            this.processException(error, response);
        }
    }

}

export default new DomainsController();