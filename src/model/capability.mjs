export class CapabilityRef {
    domainCode;
    capabilitCode;
    href;
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
    owner;
    children;
    constructor(cap) {
        for( const prop in this){
            this[prop] = cap[prop]??undefined;
        }
    }
}

export default Capability;