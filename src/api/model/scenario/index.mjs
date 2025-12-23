import { ScenarioMessageDTO } from "../../../client/src/model/scenario/index.mjs";
import { ScenarioInterfaceDTO } from "../../../client/src/model/scenario/scenario-application-dto.mjs";
import { ScenarioMethodDTO } from "../../../client/src/model/scenario/scenario-message-dto.mjs";
import { MethodMapRecord } from "../../repositories/interfaces-repository/model.mjs";

export class ScenarioApplication {
    code;
    name;
    constructor(obj) {
        this.code = obj.app_code;
        this.name = obj.app_name;
    }
}
export class ScenarioInterface extends ScenarioInterfaceDTO {
    #server_id;
    /**
     *
     */
    constructor(obj) {
        super(obj);
        this.#server_id = obj.server_id;
    }

    get key() {
        return `${this.id}-${this.#server_id}`;
    }

    get server_id() {
        return this.#server_id;
    }

    update(obj, app) {
        this.app_code = obj.app_code;
        this.application = app;
        this.code = obj.api_code;
        this.uid = obj.api_uid;
        this.source = obj.manual ? "sparx" : "c4";
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            app_code: this.app_code,
            code: this.code,
            uid: this.uid,
            source: this.source,
            methods: this.methods.length ? this.methods : undefined
        }
    }
    toString() {
        return this.app_code ? `${this.app_code}.${this.name}` : `${this.name}`
    }
}

export class ScenarioMethod extends ScenarioMethodDTO {

    /**
     * 
     * @param {MethodMapRecord} record 
     */
    addStructurizrMap(record) {
        if (!this.structurizr_map) this.structurizr_map = [];
        this.structurizr_map.push(record);
    }
    toJSON() {
        return {
            name: this.name,
            uid: this.uid,
            api_id: this.api_id,
            rps: this.rps,
            latency: this.latency,
            error_rate: this.error_rate,
            structurizr_map: this.structurizr_map
        }
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
    toString() {
        return `${this.name}`;
    }
}

export class ScenarioMessage extends ScenarioMessageDTO {

    #server_id;
    #client_id
    #contex;
    #server;
    #client;
    app_front;


    /** @type {ScenarioMessage[]} */
    subdiagramsEntries = [];

    constructor(obj = {}) {
        super(obj);
        this.#server_id = obj.server_id;
        this.#client_id = obj.client_id;
    }

    get server_id() {
        return this.#server_id;
    }
    /** @type {ScenarioInterface} */
    get server() {
        return this.#server;
    }

    set server(srv) {
        this.#server = srv;
        if (srv)
            this.server_code = srv.app_code;
    }
    /** @type {ScenarioInterface} */
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

    #metricSource
    get metricSource() {
        return this.#metricSource;
    }
    set metricSource(v) {
        this.#metricSource = v;
    }


    addValidationError(error) {
        if (!error) return;
        if (!this.validationError)
            this.validationError = [];
        else {
            if (this.validationError.find(s => s === error))
                return;
        }
        this.validationError.push(error);
        console.warn(error);
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
        return add_diagram ? `${this.uid} ${this.client_name}->${this.server_name || ""}:"${this.name || ""}" Диаграмма ${this.diagram?.name} uid=${this.diagram_uid}` :
            `${this.uid} ${this.client_name}->${this.server_name || ""}:"${this.name || ""}"`
    }
    toJSON() {
        const ret = { ...this };
        ret.server_code = this.#server?.app_code;
        ret.subdiagramsEntries = undefined;
        return ret;
    }
    toString() {
        return `${this.name}:${this.server_name}`
    }
}

export class ProcessScenario {
    name;
    uid;
    description;
    version;
    author;
    involvedIn;
    process_uid;
    process_name;
    
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
    /**@type {string} */
    name;
    /**@type {ScenarioMessage[]} */
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
    constructor(uid, name, messages, diagrams, interfaces, applications) {
        this.uid = uid;
        this.name = name;
        this.messages = messages;
        this.applications = applications;
        this.interfaces = interfaces;
        this.diagrams = diagrams;
    }
    get sequence() {
        return this.diagrams.get(this.uid)?.sequence;
    }

    /**
     * 
     * @param {*} sequence 
     * @param {*} array 
     * @returns {ScenarioMessage[]}
     */
    getAllMessages(sequence = this.sequence, array = []) {
        array.push(...sequence)
        for (const c of sequence) {
            c.sequence && this.getAllMessages(c.sequence, array);
        }
        return array;
    }
    /**
     * 
     * @param {ScenarioMessage[]} sequence 
     */
    activateMetods(sequence = this.sequence) {
        for (const msg of sequence) {
            if (msg.sequence) this.activateMetods(msg.sequence);
            if (msg.method) {
                msg.method.active = true;
                if (msg.method.api) {
                    msg.method.api.active = true;
                    if (msg.method.api.application) msg.method.api.application.active = true;
                }
            }
        }
    }
    toJSON() {

        this.activateMetods();



        return {
            name: this.name,
            uid: this.uid,
            //diagrams: this.diagrams.toArray(),
            sequence: this.sequence,
            applications: this.applications.toArray().filter(a => a.active),
            interfaces: this.interfaces.toArray().filter(i => i.active && i.methods?.length).map(i => {
                const it = new ScenarioInterfaceDTO(i);
                it.methods = it.methods?.filter(m => m.active);
                return it;
            })
        }
    }

}