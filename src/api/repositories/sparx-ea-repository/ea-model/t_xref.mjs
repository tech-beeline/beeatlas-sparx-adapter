import { v4 as uuid } from 'uuid'

export class t_xref {
    xrefid = `{${uuid().toUpperCase()}}`;;
    name;
    type;
    visibility = 'Public';
    namespace;
    requirement;
    Constraint;
    behavior;
    partition = 0;
    description;
    client;
    supplier;
    link;
    /**
     * 
     * @param {t_xref} obj 
     * @returns 
     */
    constructor(obj) {
        if (!obj) return;
        for (const fld in this) {
            if (obj[fld]) this[fld] = obj[fld];
        }
    }
    static ArchimateElementStereotype({ guid, stereotype } = {}) {
        return {
            name: 'Stereotypes', type: 'element property', visibility: 'Public', partition: 0,
            description: `@STEREO;Name=${stereotype};FQName=ArchiMate3::${stereotype};@ENDSTEREO;`,
            client: guid, supplier: '<none>'
        }
    }
};

export default t_xref;