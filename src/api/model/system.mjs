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
    rps;
    latency;
    error_rate;
    /**
     * @type {Array<APIMethodParameter>}
     */
    parameters = [];
    tags = {}

    constructor({ name, returnType, description, parameters, notes, ea_guid, operationid, rps, latency, error_rate } = {}) {
        this.name = name;
        this.returnType = returnType;
        this.desciption = description ?? notes;
        this.parameters = parameters ? parameters.map(p => p instanceof APIMethodParameter ? p : new APIMethodParameter(p)) : [];
        this.ea_guid = () => ea_guid;
        this.operationid = () => operationid
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
    protocol;
    /**
     * @type {APIMethod[]}
     */
    methods = [];
    constructor({ name, code, version, type, api_url, capabilityCode, methods, description, i_id, protocol } = {}) {
        this.name = name;
        this.code = code;
        this.version = version;
        this.type = type;
        this.api_url = api_url;
        this.capabilityCode = capabilityCode;
        this.description = description;
        this.methods = methods ?? [];
        this.protocol = protocol;
        this.ea_id = () => i_id;
    }
    /**
     * 
     * @param {*} uid 
     * @returns {APIMethod}
     */
    methodByUID(uid) {
        return this.methods?.find(m => m.ea_guid() === uid);
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
        this.description = description ?? undefined;
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

export class E2EProcessContext {
    process;
    process_uid;
    bi;
    bi_name;
    bi_uid;
    diagram;
    diagram_uid;
    seqno;
    message;
    component;
    method;
    operation_guid;
    interface;
    interface;
    system;
    constructor(obj = {}) {
        this.process = {
            name: obj.process,
            uid: obj.process_uid
        }
        this.bi = {
            name: obj.bi_name,
            uid: obj.bi_uid
        }
        this.diagram = {
            name: obj.diagram,
            uid: obj.diagram_uid
        }
        this.message = {
            seqno: obj.seqno,
            name: obj.message,
            operation: obj.operation_guid && obj.operation ? {
                name: obj.operation,
                uid: obj.operation_guid,
                interface: {
                    name: obj.interface,
                    uid: obj.interface_uid
                }
            } : undefined
        }
        this.system = {
            name: obj.sys_name,
            code: obj.sys_code
        }
    }
}


export class SystemE2EParticipition {
    /** @type {ProcessRef} */
    process;
    /** @type {MethodRef} */
    method;
    constructor(processRef, methodRef) {
        this.process = processRef;
        this.method = methodRef;
    }
}

export default class System {
    name;
    code;
    version;
    package;
    tags;
    author;
    description;
    ea_guid;
    FQName;
    status;
    modifiedDate;
    /**
     * @type {Container[]}
     */
    containers = [];
    constructor({ name, code, version, tags, containers, author, description, ea_guid, FQName, packageName, status, modifiedDate } = {}) {
        this.name = name;
        this.code = code;
        this.version = version;
        this.tags = tags;
        this.containers = containers ?? this.containers;
        this.author = author;
        this.description = description ?? undefined;
        this.ea_guid = ea_guid;
        this.FQName = FQName;
        this.package = packageName;
        this.status = status;
        this.modifiedDate = modifiedDate;
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