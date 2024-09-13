import { BadRequest, NotImplemented } from "../../utils/errors.mjs";
import capabilitiesData from "../data/capabilities-data-service.mjs";
import Capability from "../model/capability.mjs";


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
        return capabilitiesData.selectAll().then(rows => rows.map(r => new Capability(r)));
    }

    /**
     * 
     * @param {string} terms 
     * @returns 
     */
    async searchByName(terms) {
        const termsArray = terms.split([' ']).filter(t => t.length);
        if( !termsArray.length) throw BadRequest("Search terms list is empty");
        
        return capabilitiesData.searchByName(termsArray).then(rows => rows.map(r => new Capability(r)));
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<Capability>}
     */
    async getByCode(code) {
        return capabilitiesData.selectByCode(code).then(row => row ? new Capability(row) : null);
    }
}

export default new CapabiliiesService();