import capabilitiesService from "../services/capabilities-service.mjs";
import RealizationsService from "../services/realizations-service.mjs";
import { formatHREF } from "../utils/href.mjs"

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

class CapabilitiesController {
    async getCapabilities(request, response) {
        try {
            response.json((await capabilitiesService.getCapabilities()).map(c => capabilityDTO(request, c)));
        } catch (err) {
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
            let cap = await capabilitiesService.getCapaibilityByCode(request.params.code);
            if (!cap) {
                return response.status(404).send(`Capability with code ${request.params.code} not found`);
            }
            response.json(capabilityDTO(request, cap));
        } catch (err) {
            response.status(500).send(err.message);
        }
    }
    async getCapabilityChildren(request, response) {
        try {
            response.json((await capabilitiesService.getCapabilityChildren(request.params.code)).map(c => capabilityDTO(request, c)));
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
}

export default new CapabilitiesController();