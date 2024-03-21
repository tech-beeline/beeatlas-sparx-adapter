export class APIMethodParameter {
    name;
    type;
    description;
    constructor({ name, type, description } = {}) {
        this.name = name;
        this.type = type;
        this.description = description;
    }
}

export class APIMethod {
    name;
    returnType;
    desciption;
    /**
     * @type {Array<APIMethodParameter>}
     */
    parameters = [];

    constructor({ name, returnType, description, parameters } = {}) {
        this.name = name;
        this.returnType = returnType;
        this.desciption = description;
        this.parameters = parameters ? parameters.map(p => p instanceof APIMethodParameter ? p : new APIMethodParameter(p)) : [];
    }
}

export class APIInterface {
    name;
    code;
    version;
    type;
    api_url;
    capabilityCode;
    description;
    /**
     * @type {APIMethod[]}
     */
    methods = [];
    constructor({ name, code, version, type, api_url, capabilityCode, methods, description } = {}) {
        this.name = name;
        this.code = code;
        this.version = version;
        this.type = type;
        this.api_url = api_url;
        this.capabilityCode = capabilityCode;
        this.description = description;
        this.methods = methods ?? [];
    }
}
export class Container {
    name;
    code;
    version;
    tags;
    description;
    /**
     * @type {APIInterface[]}
     */
    interfaces;
    constructor({ name, code, version, tags, interfaces, description } = {}) {
        this.name = name;
        this.code = code;
        this.version = version;
        this.tags = tags;
        this.interfaces = interfaces;
        this.description = description;
    }
    addInterface(i) {
        if (!(i instanceof APIInterface)) i = new APIInterface(i)
        if (!this.interfaces) this.interfaces = [];
        this.interfaces.push(i);
    }
    interfaceByCode(code) {
        return this.interfaces?.find(i => i.code === code);
    }
}

export default class System {
    name;
    code;
    version;
    tags;
    author;
    description;
    ea_guid;
    fullName;
    /**
     * @type {Container[]}
     */
    containers = [];
    constructor({ name, code, version, tags, containers, author, description, ea_guid, fullName } = {}) {
        this.name = name;
        this.code = code;
        this.version = version;
        this.tags = tags;
        this.containers = containers ?? this.containers;
        this.author = author;
        this.description = description;
        this.ea_guid = ea_guid;
        this.fullName = fullName
    }
    /**
     * 
     * @param {{name: String, code:String, version:String, interfaces: Array<{name, code, version}>}} container 
     * @returns 
     */
    addContainer(container) {
        if (!(container instanceof Container)) container = new Container(container);
        if (!this.containers) this.containers = [];
        this.containers.push(container)
        return container;
    }
    containerByCode(code) {
        return this.containers?.find(c => c.code === code);
    }
}