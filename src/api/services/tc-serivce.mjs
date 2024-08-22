import { NotImplemented } from "../../utils/errors.mjs";


class TechnicalCapabiliiesService {
    constructor() {
        this.getAll = this.getAll.bind(this);
        this.getByCode = this.getByCode.bind(this);
    }
    async getAll() {
       NotImplemented();
    }
    async getByCode(code) {
        NotImplemented();
    }
}

export default new TechnicalCapabiliiesService();