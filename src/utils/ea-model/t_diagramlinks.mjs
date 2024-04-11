export default class t_diagramlinks {
    diagramid;
    connectorid;
    geometry;
    style;
    hidden;
    path;
    instance_id;
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
};