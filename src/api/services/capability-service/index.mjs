import { BadRequest, NotFound, NotImplemented } from "../../../utils/errors.mjs";
import { Capability } from "../../model/index.mjs";
import eaRepository from "../../repositories/sparx-ea-repository/ea-repository.mjs";
import { bcRepository } from "../../repositories/capabilities-repository/index.mjs";
import { CapabilityDTO } from "../../repositories/capabilities-repository/model.mjs";
import { capabilityAttributesEquals } from "../../repositories/capabilities-repository/utils/index.mjs";


export class CapabilityService {
    bcRepository = bcRepository;
    constructor(config) {
        this.getAll = this.getAll.bind(this);
        this.searchByName = this.searchByName.bind(this);
        this.getByCode = this.getByCode.bind(this);
    }
    /**
     * 
     * @returns {Promise<Array<Capability>>}
     */
    async getAll() {
        const cp_list = await bcRepository.all();
        return cp_list.map(bc => new Capability(bc));
    }

    /**
     * 
     * @param {string} terms 
     * @returns 
     */
    async searchByName(terms) {
        NotImplemented();
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
        return bcRepository.byCode(code).then(bc => bc ? new Capability(bc) : null);
    }

    /**
     * 
     * @param {string} code 
     * @param {Capability} capabilityData 
     */
    async putCapability(code, capabilityData) {
        capabilityData.code = code;

        if (!capabilityData) {
            throw BadRequest('В теле не передается capability')
        }

        if (!capabilityData.parent) {
            throw BadRequest('Не задана родительская возможность');
        }
        if (!capabilityData.parent.code)
            throw BadRequest(`Не указан код родительской возможности ${JSON.stringify(capabilityData.parent)}`);

        let current = await bcRepository.byCode(code);
        if (current && !await bcRepository.chechExisits(current)) {
            console.log(`Обновляемый домен с кодом ${current.code} не найден, сбрасываем кеш`);
            current = null;
        }

        if (current && capabilityAttributesEquals(capabilityData, current)
            && capabilityData.parent.code?.toLowerCase() === current.parent_code?.toLowerCase()
            && capabilityData.owner === current.owner) {
            console.log(`Обновление домена ${code} не требуется`);
            return this.getByCode(code);
        }

        return eaRepository.transactionScope(async () => {

            try {
                const result = await bcRepository.put({
                    code: capabilityData.code,
                    isDomain: capabilityData.isDomain,
                    name: capabilityData.name,
                    author: capabilityData.author,
                    description: capabilityData.description,
                    status: capabilityData.status ?? "PROPOSED",
                    parent_code: capabilityData.parent.code
                });

                await bcRepository.setCapabilityOwner(capabilityData.code, capabilityData.owner);
                result.owner = capabilityData.owner;

                return this.getByCode(code);

            } finally {
                bcRepository.invalidateCache();
            }
        })
    }
}

export const capabilitServiceInstance = new CapabilityService();

export default capabilitServiceInstance;