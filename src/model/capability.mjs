export class CapabilityRef {
    domainCode;
    capabilitCode;
    constructor({ domainCode, capabilityCode }) {
        this.domainCode = domainCode ?? undefined;
        this.capabilitCode = capabilityCode ?? undefined;
    }
}
class Capability {
    code;
    /**
     * @type {boolean}
     */
    isDomain;
    name;
    description;
    author;
    createdDate;
    modifiedDate;
    status;
    parent;
    constructor(cap) {
        for( const prop in this){
            this[prop] = cap[prop]??undefined;
        }
    }
}

export default Capability;