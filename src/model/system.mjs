export class APIMethodParameter {
    name;
    type;
    description;
    constructor({ name, type, description }) {
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
    constructor({ name, returnType, description, parameters }) {
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
    specification;
    capabilityCode;
    constructor({ name, code, version, type, specification, capabilityCode }) {
        this.name = name;
        this.code = code;
        this.version = version;
        this.type = type;
        this.specification = specification;
        this.capabilityCode = capabilityCode;
    }
}
export class Container {
    name;
    code;
    version;
    tags;
    /**
     * @type {APIInterface}
     */
    interfaces;
    constructor({ name, code, version, tags, interfaces }) {
        this.name = name;
        this.code = code;
        this.version = version;
        this.tags = tags;
        this.interfaces = interfaces;
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
    /**
     * @type {Container[]}
     */
    containers = [];
    constructor({ name, code, version, tags, containers }) {
        this.name = name;
        this.code = code;
        this.version = version;
        this.tags = tags;
        this.containers = containers ?? this.containers;
    }
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