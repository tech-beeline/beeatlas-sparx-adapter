import { NotFound, NotImplemented } from "../../../utils/errors.mjs";
import { TechnicalCapabilitiesRepository } from '../../repositories/index.mjs'
import TechnicalCapability from "../../model/technical-capability-model.mjs";
import { createTC, updateTC } from "./put-tc.mjs";
import tc_cache from './tc-cache.mjs';

const tcDataService = new TechnicalCapabilitiesRepository();

export class TechnicalCapabiliiesService {
    constructor() {
        this.getAll = this.getAll.bind(this);
        this.getByCode = this.getByCode.bind(this);
    }
    /**
     * 
     * @returns {Promise<Array<TechnicalCapability>>}
     */
    async getAll() {
        return tc_cache.all();
    }

    async getByCode(code) {
        const tc = await tc_cache.byCode(code);
        if (!tc) throw NotFound(`TC с кодом = ${code} не найден`);
        return tc;
    }
    /**
     * 
     * @param {TechnicalCapability} targetTC 
     * @returns {Promise<TechnicalCapability>}
     */
    async putTC(targetTC) {
        if (!targetTC.system?.code) throw Error("У ТС не найден код системы system.code");

        const [currentTC] = await tcDataService.selectAppTcByCode(targetTC.system.code, targetTC.code);
        if (currentTC) currentTC.system = { code: currentTC.sys_code };

        currentTC ? (await updateTC(currentTC, targetTC)) :
            await createTC(targetTC);

        return tc_cache.update(targetTC);
    }
}