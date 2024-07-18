import { v4 as uuid } from 'uuid'

export default class t_object {
    object_id;
    object_type;
    diagram_id;
    name;
    alias;
    author;
    version;
    note;
    package_id;
    stereotype;
    ntype;
    complexity;
    effort;
    style;
    backcolor;
    borderstyle;
    borderwidth;
    fontcolor;
    bordercolor;
    createddate;
    modifieddate;
    status;
    abstract;
    tagged;
    pdata1;
    pdata2;
    pdata3;
    pdata4;
    pdata5;
    concurrency;
    visibility;
    persistence;
    cardinality;
    gentype;
    genfile;
    header1;
    header2;
    phase;
    scope;
    genoption;
    genlinks;
    classifier;
    ea_guid = `{${uuid().toUpperCase()}}`;
    parentid;
    runstate;
    classifier_guid;
    tpos;
    isroot;
    isleaf;
    isspec;
    isactive;
    stateflags;
    packageflags;
    multiplicity;
    styleex;
    actionflags;
    eventflags;
    docvector;
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
        if (obj.description && !this.note) this.note = obj.description
    }
    beforeCreate() {
    }
}