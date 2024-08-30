import { NotFound, NotImplemented } from "../../utils/errors.mjs";
import dataService from "../data/e2e-data-service.mjs";

class E2EProcessService {
    async getE2EList() {
        const rows = await dataService.selectAllE2E();
        return rows.map(r => ({ name: r.name, uid: r.uid }))
    }
    async getE2E(uid) {
        const e2e = await dataService.selectE2EByUID(uid);
        if (!e2e) throw NotFound(`Process with uid = "${uid}" not found`);
        return { name: e2e.name, uid: e2e.uid }
    }
    async getE2EBusinessInteractions(uid) {
        NotImplemented();
    }
    async GetE2EMessages(uid) {
        NotImplemented();
    }
    async getBIMessages(uid) {
        NotImplemented();
    }
    async getBIScenario(uid) {
        NotImplemented();
    }
}

export default new E2EProcessService();