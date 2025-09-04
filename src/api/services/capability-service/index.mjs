import { BadRequest, NotFound, NotImplemented } from "../../../utils/errors.mjs";
import { capabilityRepositoryInstance } from "../../repositories/index.mjs";
import { Capability } from "../../model/index.mjs";
import eaRepository from "../../repositories/sparx-ea-repository/ea-repository.mjs";
import {
    bcRepository,
    domainsRepositoryInstance
} from "../../repositories/capabilities-repository/index.mjs";


export class CapabilityService {
    capabilitiesRepository
    bcRepository = bcRepository;
    domainsRepository = domainsRepositoryInstance;

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
        const [domains, bcs] = await Promise.all([domainsRepositoryInstance.all(), bcRepository.all()]);
        return [...domains, ...bcs].map(bc => new Capability(bc));
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
        const dmn = await domainsRepositoryInstance.byCode(code);
        if (dmn) return new Capability(dmn);
        return bcRepository.byCode(code).then(bc => bc ? new Capability(bc) : null);
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
            throw BadRequest(`Не указан код родительской возможности ${JSON.stringify(capabilityData.parent)}`);

        return eaRepository.transactionScope(async () => {

            const parent = await this.getByCode(capabilityData.parent.code);
            if (!parent) throw NotFound(`Не найден родительская возможность с кодом=${capabilityData.parent.code}`);
            capabilityData.code = code;
            const current_capability = await this.getByCode(code);
            if (current_capability && current_capability.isDomain != capabilityData.isDomain)
                throw BadRequest(`Изменение типа возможности запрещено`);

            const result = capabilityData.isDomain ? (await domainsRepositoryInstance.put(capabilityData)) : (await bcRepository.put(capabilityData));

            if (!current_capability || current_capability.owner != capabilityData.owner)
                await this.capabilitiesRepository.setCapabilityOwner(capability.code, capabilityData.owner);
            result.owner = capabilityData.owner;
            return this.getByCode(code);
        })
    }
}

export const capabilitServiceInstance = new CapabilityService();

export default capabilitServiceInstance;