import { NotImplemented } from "../../utils/errors.mjs";
import capabilitiesData from "../data/capabilities-data-service.mjs";
import Capability from "../model/capability.mjs";


class CapabiliiesService {
    constructor() {
        this.getAll = this.getAll.bind(this);
        this.getByCode = this.getByCode.bind(this);
    }
    async getAll() {
        return capabilitiesData.selectAll().then(rows => rows.map(r => new Capability(r)));
    }
    async getByCode(code) {
        return capabilitiesData.selectByCode(code).then(row => row ? new Capability(row) : null);
    }
}

export default new CapabiliiesService();