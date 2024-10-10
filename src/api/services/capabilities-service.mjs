import { BadRequest, NotImplemented } from "../../utils/errors.mjs";
import { CapabilitiesRepository } from "../repositories/index.mjs";
import Capability from "../model/capability.mjs";

const capabilitiesRepository = new CapabilitiesRepository();

class CapabiliiesService {

    constructor() {
        this.getAll = this.getAll.bind(this);
        this.searchByName = this.searchByName.bind(this);
        this.getByCode = this.getByCode.bind(this);
    }
    /**
     * 
     * @returns {Promise<Array<Capability>>}
     */
    async getAll() {
        return capabilitiesRepository.selectAll().then(rows => rows.map(r => new Capability(r)));
    }

    /**
     * 
     * @param {string} terms 
     * @returns 
     */
    async searchByName(terms) {
        const termsArray = terms.split([' ']).filter(t => t.length);
        if (!termsArray.length) throw BadRequest("Search terms list is empty");

        return capabilitiesRepository.searchByName(termsArray).then(rows => rows.map(r => new Capability(r)));
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<Capability>}
     */
    async getByCode(code) {
        return capabilitiesRepository.selectByCode(code).then(row => row ? new Capability(row) : null);
    }
}

export default new CapabiliiesService();