export class CapabilityBaseDTO {
    isDomain = false;
    name;
    code;
    description;
    author;
    status;
    description;
    createdDate;
    package_id;
    object_id;
    #owner;
    parent_code;
    children = [];
    /**@type {CapabilityBaseDTO} */
    #parent;
    /**@type {DomainDTO} */
    domain;
    left;
    right;
    top;
    bottom;

    /**
     * 
     * @param {CapabilityBaseDTO} src 
     * @returns 
     */
    constructor(src) {
        if (!src) return;
        for (const prop in this) {
            if (src[prop]) this[prop] = src[prop];
        }
    }
    get owner() {
        return this.#owner ?? this.#parent?.owner;
    }
    set owner(val) {
        this.#owner = val;
    }
    /**
     * 
     * @param {CapabilityBaseDTO} parent 
     */
    setParent(parent) {
        if (this.#parent) {
            parent.children = parent.children.filter(c => c != this);
        }
        if (parent) {
            this.#parent = parent;
            this.parent_code = parent.code;
            parent.children.push(this);
        }
    }
    /**
     * 
     * @param {DomainDTO} domain 
     */
    setDomain(domain) {
        this.domain = domain;
        domain.members.push(this);
    }
    /**
     * 
     * @param {Array} arr 
     */
    addChildrenRecursive(arr) {
        arr.push(...this.children);
        for (const c of this.children) {
            c.addChildrenRecursive(arr);
        }
        return arr;
    }
    toString() {
        return `[${this.code}] ${this.name}`;
    }
    hasParent(code) {
        return this.parent_code?.toLowerCase() == code.toLowerCase() || (this.#parent && this.#parent.hasParent(code));
    }
}


export class DomainDTO extends CapabilityBaseDTO {
    autoDiagramId;
    bcPackageId;
    members = [];
    /**
     *
     */
    constructor(src) {
        super(src);
        this.setDomain(this);
    }
    toString() {
        return `[${this.code}] ${this.name}`;
    }
}