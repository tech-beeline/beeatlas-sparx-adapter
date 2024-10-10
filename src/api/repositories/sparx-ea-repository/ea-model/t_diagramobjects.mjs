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
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
}

export default t_diagramobjects;