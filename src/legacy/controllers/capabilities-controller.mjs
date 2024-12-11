import capabilitiesService from "../services/capabilities-service.mjs";
import RealizationsService from "../services/realizations-service.mjs";
import { formatHREF } from "../../utils/href.mjs"

export function capabilityDTO(request, capability) {
    return {
        code: capability.code,
        href: formatHREF(request, `/api/capabilities/${capability.code}`),
        name: capability.name,
        description: capability.description,
        createdDate: capability.createdDate,
        modifiedDate: capability.modifiedDate,
        author: capability.author,
        status: capability.status,
        parent: capability.parentAlias ? {
            code: capability.parentAlias,
            href: formatHREF(request, `/api/capabilities/${capability.parentAlias}`)
        } : undefined,
        domain: capability.domainAlias ? {
            code: capability.domainAlias,
            href: formatHREF(request, `/api/domains/${capability.domainAlias}`)
        } : undefined,
        owner: capability.owner ? {
            fullName: capability.owner
        } : undefined
    };
}

function processError(error, response) {
    console.error(error);
    if (error.status) {
        return response.status(error.status).json({ message: error.message });
    }
    return response.status(500).json({ message: error.message })
}

class CapabilitiesController {
    constructor() {
        this.getCapabilityByCode = this.getCapabilityByCode.bind(this);
    }

    async getCapabilities(request, response) {
        try {
            response.json((await capabilitiesService.getCapabitiesAsFlatList()));
        } catch (err) {
            console.error(err);
            response.status(500).send(err.message);
        }
    }
    async getCapabilitiesTree(request, response) {
        try {
            response.json((await capabilitiesService.getCapabilitiesTree()));
        } catch (err) {
            console.error(err);
            response.status(500).send(err.message);
        }
    }
     /**
     * 
     * @param {Express.Request} request 
     * @param {*} response 
     */
    async putCapability(request, response) {
        try {
            response.json( await capabilitiesService.putCapability(request.params.code, request.body))
        } catch (err) {
            console.error(err);
            response.status(500).send(err.message);
        }
    }
    /**
     * 
     * @param {Express.Request} request 
     * @param {*} response 
     */
    async getCapabilityByCode(request, response) {
        try {
            if (request.params.code.toLowerCase() === "tree") {
                return this.getCapabilitiesTree(request, response);
            }
            let cap = await capabilitiesService.getCapabilityByCode(request.params.code);
            if (!cap) {
                return response.status(404).send(`Capability with code = "${request.params.code}" not found`);
            }
            response.json(cap);
        } catch (err) {
            console.error(err);
            response.status(500).send(err.message);
        }
    }
    async getCapabilityChildren(request, response) {
        try {
            response.json((await capabilitiesService.getCapabilityChildren(request.params.code)));
        } catch (err) {
            response.status(500).send(err.message);
        }
    }
    async getCapabilityRealizations(request, response) {
        try {
            response.json(await RealizationsService.getCapabilityRealizations(request.params.code));
        } catch (err) {
            response.status(500).send(err.message);
        }
    }
    async createCapability(request, response) {
        try {
            let capability_data = request.body;
            if (!capability_data.domain?.code && !capability_data.parent?.code) {
                throw Object.assign(Error('Не указан домен или родительская возможность'), { status: 400 });
            }
            return response.json(capabilityDTO(request, await capabilitiesService.createCapability(capability_data)));
        } catch (error) {
            return processError(error, response);
        }
    }
    async updateCapability(request, response) {
        try {
            response.json(capabilityDTO(request, await capabilitiesService.updateCapability({ code: request.params.code, ...request.body })))
        } catch (error) {
            processError(error, response);
        }
    }
    async deleteCapability(request, response) {
        try {
            await capabilitiesService.deleteCapability(request.params.code);
            return response.json({ message: `Capability "${request.params.code}" success deleted"` });
        } catch (error) {
            processError(error, response);
        }
    }
}

export default new CapabilitiesController();