import { NotFound, NotImplemented } from "../../utils/errors.mjs";
import { E2EProcessRepository } from "../repositories/index.mjs";


const processesRepository = new E2EProcessRepository();

function E2EProcess(r) {
    return { name: r.name, uid: r.uid, version: r.version };
}
class E2EProcessService {
    

    async getE2EList() {
        const rows = await processesRepository.selectAllE2E();
        return rows.map(r => E2EProcess(r))
    }
    async getE2E(uid) {
        const e2e = await processesRepository.selectE2EByUID(uid);
        if (!e2e) throw NotFound(`Process with uid = "${uid}" not found`);
        return E2EProcess(e2e);
    }
    async getE2EBusinessInteractions(uid) {
        NotImplemented();
    }
    async getE2EMessages(uid) {
        const e2e = await processesRepository.selectE2EByUID(uid);
        if (!e2e) throw NotFound(`Process with uid = "${uid}" not found`);
        const biList = await processesRepository.selectE2E_BI(uid);

        const biMessages = await Promise.all(biList.map(bi =>
            this.getBIMessages(bi.uid)
                .then(ml => ({ bi: bi, messages: ml }))));
        return biMessages;
    }
    async getBIMessages(uid) {
        return (await processesRepository.selectBIMessages(uid))
            .filter(m => m.name);
    }
    async getBIScenario(uid) {
        NotImplemented();
    }
}

export default new E2EProcessService();