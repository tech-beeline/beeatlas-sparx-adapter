import { NotImplemented } from "../../../utils/errors.mjs";
import { E2EProcess, ProcessScenario } from "../../model/index.mjs";
import { E2EProcessRepository } from "../../repositories/index.mjs";

const processesRepository = new E2EProcessRepository();

export class E2EProcessService {
    /**
     * 
     * @returns {Promise<Array<E2EProcess>>}
     */
    async getE2EList() {
        const rows = await processesRepository.selectAllE2E();
        return rows.map(r => new E2EProcess(r))
    }
    async getE2E(uid) {
        const e2e = await processesRepository.selectE2EByUID(uid);
        if (!e2e) throw NotFound(`Process with uid = "${uid}" not found`);
        return new E2EProcess(e2e);
    }
    async getE2EScenarios(uid) {
        return processesRepository.selectE2EScenarios(uid)
            .then(rows => rows.map(row => new ProcessScenario(row)));
    }
    async getE2EMessages(uid) {
        const e2e = await processesRepository.selectE2EByUID(uid);
        if (!e2e) throw NotFound(`Process with uid = "${uid}" not found`);
        const biList = await processesRepository.selectE2EScenarios(uid);

        const biMessages = await Promise.all(biList.map(bi =>
            this.getBIMessages(bi.uid)
                .then(ml => ({ bi: bi, messages: ml }))));
        return biMessages;
    }
    
    async getBIMessages(uid) {
        return (await processesRepository.selectBIMessages(uid))
            .filter(m => m.name);
    }
}