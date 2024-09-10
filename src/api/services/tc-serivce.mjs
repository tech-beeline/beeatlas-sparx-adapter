import { NotFound, NotImplemented } from "../../utils/errors.mjs";
import tcDataService from '../data/tc-data-service.mjs'
import TechnicalCapability from "../model/technical-capability-model.mjs";

class TechnicalCapabiliiesService {
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
            tcDataService.selectTCData(code),
            tcDataService.selectParentBCForTC(code)
        ]);

        if (!tc_row) throw NotFound(`TC with code="${code}" not found`);

        const tc = new TechnicalCapability(tc_row);
        bc_rows.forEach(bc => tc.addParent({ code: bc.bc_code, name: bc.bc_name }))
        return tc;
    }
}

export default new TechnicalCapabiliiesService();