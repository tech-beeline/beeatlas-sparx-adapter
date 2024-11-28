export class CapabilitDTO {
    /**
     *
     */
    constructor(src) {
        if (!src) return;
        for (const prop in this) {
            this[prop] = src[prop] ?? undefined;
        }
    }
    name;
    isDomain;
    code;
    author;
    createddate;
    modifieddate;
    status;
    parent;
    description;
    owner;
}

export class CapabilityDTOInternal extends CapabilitDTO {
    /**
     *
     */
    constructor(src) {
        super(src);
        Object.defineProperty(this, "object_id", {
            get: function () { return src.object_id; }
        });
        Object.defineProperty(this, "package_id", {
            get: function () { return src.package_id; }
        });
        Object.defineProperty(this, "connector_id", {
            get: function () { return src.connector_id; }
        });
    }
    get object_id() {
    }
    get package_id() {
    }
    get connector_id() { }
}

export class OwnerDTO {
    name;
    object_id;

    constructor(src) {
        if (!src) return;
        for (const prop in this) {
            this[prop] = src[prop] ?? undefined;
        }
    }
}
