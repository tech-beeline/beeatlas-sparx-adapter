export class MapicPublishedApi {
    id;
    status;
    context;
    spec;
    api;
    constructor(val) {
        this.id = val.id;
        this.status = val.statusName;
        this.context = val.apiContext;
    }
}

export class MapicApi {
    id;
    /**@type {MapicCapability} */
    capability;
    status;
    context;
    spec;
    /**@type {MapicPublishedApi[]} */
    published_api;
    constructor(val) {
        this.id = val.id;
        this.status = val.statusName;
        this.context = val.providerContext;
    }
}

export class MapicCapability {
    /** @type {MapicProduct} */
    product;
    /** @type {number} */
    id;
    name;
    status;
    constructor(val) {
        this.id = val.id;
        this.name = val.name;
        this.status = val.statusName;
    }
}

export class MapicProduct {
    /**@type {string} */
    cmdb;
    /**@type {number} */
    id;
    load_date;
    /**@type {MapicCapability[]} */
    capabilities;
    constructor(val) {
        this.id = val.id;
        this.cmdb = val.externalId ?? val.cmdb;
    }
}