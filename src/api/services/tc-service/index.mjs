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
    /**
     * 
     * @returns {Promise<Array<TechnicalCapability>>}
     */
    async getAll() {
        const tc_rows = await tcDataService.selectTCList();
        const tc_map = {};

        for (const row of tc_rows) {
            const tc = tc_map[row.code] ?? (tc_map[row.code] = new TechnicalCapability(row));
            tc.addParent({ code: row.parent_code });
        }

        return Object.values(tc_map);
    }

    async getByCode(code) {
        const tc_rows = await tcDataService.selectTCByCode(code);

        if (!tc_rows.length) throw NotFound(`TC with code="${code}" not found`);

        const tc = new TechnicalCapability(tc_rows[0]);
        tc_rows.forEach(bc => tc.addParent({ code: bc.parent_code }));
        return tc;
    }
    /**
     * 
     * @param {TechnicalCapability} targetTC 
     * @returns {Promise<TechnicalCapability>}
     */
    async putTC(targetTC) {
        const [currentTC] = await tcDataService.selectTCByCode(targetTC.code);
        if (currentTC) currentTC.system = { code: currentTC.sys_code };

        currentTC ? (await updateTC(currentTC, targetTC)) : await createTC(targetTC)
        return this.getByCode(targetTC.code);
    }
}