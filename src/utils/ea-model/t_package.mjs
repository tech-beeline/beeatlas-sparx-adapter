import { v4 as uuid } from 'uuid'

export default class t_package {
    package_id;
    name;
    parent_id;
    createddate;
    modifieddate;
    notes;
    ea_guid = `{${uuid().toUpperCase()}}`;
    xmlpath;
    iscontrolled;
    lastloaddate;
    lastsavedate;
    version;
    protected;
    pkgowner;
    umlversion;
    usedtd;
    logxml;
    codepath;
    namespace;
    tpos;
    packageflags;
    batchsave;
    batchload;
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
}