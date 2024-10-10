import { v4 as uuid } from 'uuid'

export class t_operation {
    operationid;
    object_id;
    name;
    scope;
    type;
    returnarray;
    stereotype;
    isstatic;
    concurrency;
    notes;
    behaviour;
    abstract;
    genoption;
    synchronized;
    pos;
    const;
    style;
    pure;
    throws;
    classifier;
    code;
    isroot;
    isleaf;
    isquery;
    stateflags;
    ea_guid = `{${uuid().toUpperCase()}}`;
    styleex;
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
}

export default t_operation;