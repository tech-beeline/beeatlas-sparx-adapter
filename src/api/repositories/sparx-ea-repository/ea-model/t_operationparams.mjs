import { v4 as uuid } from 'uuid'

export class t_operationparams {
    operationid;
    name;
    type;
    Default;
    notes;
    pos;
    const;
    style;
    kind;
    classifier;
    ea_guid = `{${uuid().toUpperCase()}}`;
    styleex;
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
}

export default t_operationparams;