export class ScenarioApplication {
    code;
    name;
    constructor(obj) {
        this.code = obj.app_code;
        this.name = obj.app_name;
    }
}
export class ScenarioIntrerface {
    id;
    name;
    app_code;
    #app;
    methods = [];
    constructor(obj) {
        this.id = obj.api_id;
        this.name = obj.api_name;
    }
    update(obj, app) {
        this.app_code = obj.app_code;
        this.#app = app;
    }
    get app() {
        return this.#app;
    }
    toJSON() {
        return { id: this.id, name: this.name, app_code: this.app_code, methods: this.methods.length ? this.methods : undefined }
    }
}

export class ScenarioMethod {
    name;
    uid
    api_id;
    show_in_e2e;
    #api;
    constructor(obj) {
        this.uid = obj.operation_guid;
        this.name = obj.method;
        this.api_id = obj.api_id;
        this.show_in_e2e = obj.show_in_e2e || undefined;
    }
    set api(api) {
        this.#api = api;
    }
    get api() {
        return this.#api;
    }
}

export class ScenarioDiagram {
    name;
    uid;
    #messages = [];
    sequence = [];
    constructor(obj) {
        this.name = obj.diagram;
        this.uid = obj.diagram_uid;
    }
    addMessage(msg) {
        this.#messages.push(msg);
    }
    /** @type {ScenarioMessage[]} */
    get messages() {
        return this.#messages;
    }
    toJSON() {
        return { name: this.name, uid: this.uid };
    }
}

export class ScenarioMessage {
    consumer;
    supplier;
    name;
    uid;
    stereotype;
    rps;
    latency;
    operation_guid;
    error_rate;
    /** @type {[]} */
    validationError;
    /** @type {ScenarioDiagram} */
    diagram_uid;
    seqno;
    server_name;
    client_name;
    is_ret;
    linked_diagram_uid;
    infoMessages;
    /** @type {ScenarioMessage[]} */
    sequence;

    #diagram;
    #method;
    #server_id;
    #client_id
    #contex;
    #server;
    #client;
    /** @type {ScenarioMessage[]} */
    subdiagramsEntries = [];

    constructor(obj) {
        for (const key in this) {
            if (obj[key]) this[key] = obj[key];
        }
        this.#server_id = obj.server_id;
        this.#client_id = obj.client_id;
    }
    /** @type {ScenarioDiagram} */
    get diagram() {
        return this.#diagram;
    }
    set diagram(d) {
        this.#diagram = d;
    }
    /** @type {ScenarioMethod} */
    get method() {
        return this.#method;
    }
    set method(m) {
        this.#method = m;
    }
    get server_id() {
        return this.#server_id;
    }
    /** @type {ScenarioIntrerface} */
    get server() {
        return this.#server;
    }

    set server(srv) {
        this.#server = srv;
    }
    /** @type {ScenarioIntrerface} */
    get client() {
        return this.#client;
    }
    set client(client) {
        this.#client = client;
    }
    get client_id() {
        return this.#client_id;
    }
    /** @type {ScenarioMessage} */
    get context() {
        return this.#contex;
    }

    addValidationError(error) {
        if (!error) return;

        console.warn(error);
        if (!this.validationError) this.validationError = [];
        this.validationError.push(error);
    }
    addInfoMessage(msg) {
        console.info(msg);
        (this.infoMessages || (this.infoMessages = [])).push(msg);
        return this;
    }
    /**
     * 
     * @param {ScenarioMessage} msg 
     */
    addScenarioMessage(msg) {
        (this.sequence || (this.sequence = [])).push(msg);
        msg.#contex = this;
    }
    display(add_diagram) {
        return add_diagram ? `${this.uid} ${this.client_name}->${this.server_name || ""}:"${this.name || ""}" Диаграмма ${this.diagram?.name} uid=${this.diagram_uid}` : `${this.uid} ${this.client_name}->${this.server_name || ""}:"${this.name || ""}"`
    }
    toJSON() {
        const ret = { ...this };
        if (ret.subdiagramsEntries.length === 0)
            ret.subdiagramsEntries = undefined;
        return ret;
    }
}

export class ProcessScenario {
    name;
    uid;
    description;
    version;
    author;
    involvedIn;
    constructor(obj) {
        for (const prop in this) {
            this[prop] = obj[prop] ?? undefined;
        }
    }
}



export class ScenarioDictionary {
    #key;
    #type;
    #items = {};
    constructor(key, type) {
        this.#key = key;
        this.#type = type;
    }
    /**@type {Array} */
    toArray() {
        return Object.values(this.#items);
    }
    update(obj) {
        if (!obj[this.#key])
            return undefined;
        if (this.#items[obj[this.#key]]) return this.#items[obj[this.#key]];
        return this.#items[obj[this.#key]] = new this.#type(obj);
    }
    get(key) {
        return this.#items[key];
    }
}

export class ScenarioDiagramDictionary extends ScenarioDictionary {
    /**
     *
     */
    constructor() {
        super("diagram_uid", ScenarioDiagram);
    }
}

export class ScenarioApplicationDictionary extends ScenarioDictionary {
    /**
     *
     */
    constructor() {
        super("app_code", ScenarioApplication);
    }
}

export class Scenario {
    uid;
    /** @type {ScenarioMessage[]} */
    messages;
    /** @type {ScenarioDictionary} */
    diagrams;
    /** @type {ScenarioDictionary} */
    interfaces;
    /** @type {ScenarioDictionary} */
    applications;
    /**
     * 
     * @param {ScenarioMessage[]} messages 
     * @param {ScenarioDictionary} diagrams 
     * @param {ScenarioDictionary} interfaces 
     * @param {ScenarioDictionary} applications 
     */
    constructor(uid, messages, diagrams, interfaces, applications) {
        this.uid = uid;
        this.messages = messages;
        this.applications = applications;
        this.interfaces = interfaces;
        this.diagrams = diagrams;
    }
    toJSON() {
        return {
            diagrams: this.diagrams.toArray(),
            applications: this.applications.toArray(),
            interfaces: this.interfaces.toArray(),
            sequence: this.diagrams.get(this.uid)?.sequence
        }
    }
}