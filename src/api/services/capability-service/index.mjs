import { BadRequest, NotFound, NotImplemented } from "../../../utils/errors.mjs";
import { capabilityRepositoryInstance } from "../../repositories/index.mjs";
import { Capability } from "../../model/index.mjs";
import eaRepository from "../../repositories/sparx-ea-repository/ea-repository.mjs";


export class CapabilityService {
    capabilitiesRepository

    constructor(config) {
        this.capabilitiesRepository = capabilityRepositoryInstance

        this.getAll = this.getAll.bind(this);
        this.searchByName = this.searchByName.bind(this);
        this.getByCode = this.getByCode.bind(this);
    }
    /**
     * 
     * @returns {Promise<Array<Capability>>}
     */
    async getAll() {
        return this.capabilitiesRepository.selectAll().then(rows => rows.map(r => new Capability(r)));
    }

    /**
     * 
     * @param {string} terms 
     * @returns 
     */
    async searchByName(terms) {
        const termsArray = terms.split([' ']).filter(t => t.length);
        if (!termsArray.length) throw BadRequest("Search terms list is empty");

        return this.capabilitiesRepository.searchByName(termsArray).then(rows => rows.map(r => new Capability(r)));
    }

    /**
     * 
     * @param {string} code 
     * @returns {Promise<Capability>}
     */
    async getByCode(code) {
        return this.capabilitiesRepository.selectByCode(code).then(row => row ? new Capability(row) : null);
    }
    /**
     * 
     * @param {string} code 
     * @param {Capability} capabilityData 
     */
    async putCapability(code, capabilityData) {
        if (!capabilityData) {
            throw BadRequest('В теле не передается capability')
        }

        if (!capabilityData.parent) {
            throw BadRequest('Не задана родительская возможность');
        }
        if (!capabilityData.parent.code)
            throw BadRequest(`У родительской возможности не указан код ${JSON.stringify(capabilityData.parent)}`);

        return eaRepository.transactionScope(async () => {
            const parent = await this.capabilitiesRepository.selectByCode(capabilityData.parent.code);
            if (!parent) throw NotFound(`Не найден родительская возможность с кодом=${capabilityData.parent.code}`);

            capabilityData.code = code;

            const capability = await this.capabilitiesRepository.upsertCapability(
                capabilityData.parent.code,
                capabilityData.isDomain,
                capabilityData.code,
                capabilityData.name,
                capabilityData.description,
                capabilityData.author,
                capabilityData.status);

            await this.capabilitiesRepository.setCapabilityOwner(capability.code, capabilityData.owner);
            capability.owner = capabilityData.owner;
            return this.getByCode(code);
        })
    }
}

export const capabilitServiceInstance = new CapabilityService();

export default capabilitServiceInstance;