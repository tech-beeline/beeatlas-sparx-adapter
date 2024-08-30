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
    async getE2EMessages(uid) {
        const e2e = await dataService.selectE2EByUID(uid);
        if (!e2e) throw NotFound(`Process with uid = "${uid}" not found`);
        const biList = await dataService.selectE2E_BI(uid);
        console.log(biList);
        const biMessages = await Promise.all(biList.map(bi =>
            this.getBIMessages(bi.uid)
                .then(ml => ({ bi: bi, messages: ml }))));
        return biMessages;
    }
    async getBIMessages(uid) {
        return (await dataService.selectBIMessages(uid))
            .filter(m => m.name);
        NotImplemented();
    }
    async getBIScenario(uid) {
        NotImplemented();
    }
}

export default new E2EProcessService();