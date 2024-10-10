import { v4 as uuid } from 'uuid'

export class t_diagram {
    diagram_id;
    package_id;
    parentid;
    diagram_type;
    name;
    version;
    author;
    showdetails;
    notes;
    stereotype;
    attpub;
    attpri;
    attpro;
    orientation;
    cx;
    cy;
    scale;
    createddate;
    modifieddate;
    htmlpath;
    showforeign;
    showborder;
    showpackagecontents;
    pdata;
    locked;
    ea_guid = `{${uuid().toUpperCase()}}`;
    tpos;
    swimlanes;
    styleex;

    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
}