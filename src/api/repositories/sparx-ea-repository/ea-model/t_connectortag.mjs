import { v4 as uuid } from 'uuid'

export  class t_connectortag{
    propertyid;
    elementid;
    property;
    value;
    notes;
    ea_guid = `{${uuid().toUpperCase()}}`;
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
}