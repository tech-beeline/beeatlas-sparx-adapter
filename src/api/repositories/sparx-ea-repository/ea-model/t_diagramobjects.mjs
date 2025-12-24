import { t_object } from "./t_object.mjs";

export class t_diagramobjects {
    diagram_id;
    object_id;
    recttop;
    rectleft;
    rectright;
    rectbottom;
    sequence;
    objectstyle;
    instance_id;
    /**
     * 
     * @param {t_diagramobjects} obj 
     * @returns 
     */
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
}

export class t_diagramobjects_ex extends t_object {
    diagram_id;
    recttop;
    rectleft;
    rectright;
    rectbottom;
    sequence;
    objectstyle;
    instance_id;
    constructor(obj) {
        super(obj);
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
}

export default t_diagramobjects;