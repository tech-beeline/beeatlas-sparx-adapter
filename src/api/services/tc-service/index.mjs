import { NotFound, NotImplemented } from "../../../utils/errors.mjs";
import { TechnicalCapabilitiesRepository } from '../../repositories/index.mjs'
import TechnicalCapability from "../../model/technical-capability-model.mjs";
import { createTC, updateTC } from "./put-tc.mjs";

const tcDataService = new TechnicalCapabilitiesRepository();

export class TechnicalCapabiliiesService {
    constructor() {
        this.getAll = this.getAll.bind(this);
        this.getByCode = this.getByCode.bind(this);
    }
    async getAll() {
        const [tc_rows, bc_rows] = await Promise.all([
            tcDataService.selectTCList(),
            tcDataService.selectParentBC()
        ]);
        const tc_map = tc_rows.reduce((acc, v) => Object.assign(acc, { [v.code]: new TechnicalCapability(v) }), {})
        bc_rows.forEach(bc => tc_map[bc.tc_code]?.addParent({ code: bc.bc_code, name: bc.bc_name }))
        return Object.values(tc_map);
    }
    async getByCode(code) {
        const [tc_row, bc_rows] = await Promise.all([
            tcDataService.selectTCByCode(code),
            tcDataService.selectParentBCForTC(code)
        ]);

        if (!tc_row) throw NotFound(`TC with code="${code}" not found`);

        const tc = new TechnicalCapability(tc_row);
        bc_rows.forEach(bc => tc.addParent({ code: bc.bc_code, name: bc.bc_name }))
        return tc;
    }
    /**
     * 
     * @param {TechnicalCapability} targetTC 
     * @returns {Promise<TechnicalCapability>}
     */
    async putTC(targetTC) {
        const currentTC = await tcDataService.selectTCByCode(targetTC.code);
        if (currentTC) currentTC.system = { code: currentTC.sys_code };

        currentTC ? await updateTC(currentTC, targetTC) : await createTC(targetTC)
        return this.getByCode(targetTC.code);
    }
}