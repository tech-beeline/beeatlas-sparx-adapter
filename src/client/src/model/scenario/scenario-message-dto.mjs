import { ScenarioApplicationDTO, ScenarioInterfaceDTO } from "./scenario-application-dto.mjs";

export class ScenarioMethodDTO {
    name;
    uid
    api_id;
    show_in_e2e;
    app_front;
    rps;
    latency;
    error_rate;
    /**@type  {MethodMapRecord[]} */
    structurizr_map;
    /**@type {ScenarioInterfaceDTO} */
    #api;
    constructor(obj) {
        this.uid = obj.operation_guid;
        this.name = obj.method;
        this.api_id = obj.api_id;
        this.rps = obj.rps;
        this.latency = obj.latency;
        this.error_rate = obj.error_rate;
        this.show_in_e2e = obj.show_in_e2e || undefined;
        this.app_front = obj.app_front || undefined;
        this.structurizr_map = this.structurizr_map;
    }
    set api(api) {
        this.#api = api;
    }
    get api() {
        return this.#api;
    }
    #sla(name) {
        return this.structurizr_map?.[0]?.[name] == null ? this[name] : this.structurizr_map?.[0]?.[name];
    }
    get sla() {
        return {
            rps: this.#sla("rps"),
            latency: this.#sla("latency"),
            error_rate: this.#sla("error_rate")
        }
    }
    toString(){
        return `${this.name}[${this.#api}]`;
    }
}


export class ScenarioMessageDTO {
    /**@type {string} */
    name;
    uid;
    stereotype;
    rps;
    latency;
    error_rate;
    operation_guid;
    /** @type {[]} */
    validationError;
    /** @type {ScenarioDiagram} */
    diagram_uid;
    seqno;
    client_name;
    client_code;
    server_name;
    server_code;

    is_ret;
    linked_diagram_uid;
    infoMessages;
    /** @type {ScenarioMessageDTO[]} */
    sequence;
    #method;
    /** @type {ScenarioMethodDTO} */
    get method() {
        return this.#method;
    }
    set method(m) {
        this.#method = m;
    }

    #diagram;
    /** @type {ScenarioDiagram} */
    get diagram() {
        return this.#diagram;
    }
    set diagram(d) {
        this.#diagram = d;
    }

    constructor(obj = {}) {
        this.name = obj.name;
        this.uid = obj.uid;
        this.stereotype = obj.stereotype;
        this.rps = obj.rps;
        this.latency = obj.latency;
        this.error_rate = obj.error_rate;
        this.operation_guid = obj.operation_guid;
        this.validationError = obj.validationError;
        this.diagram_uid = obj.diagram_uid;
        this.seqno = obj.seqno;;
        this.client_name = obj.client_name;
        this.client_code = obj.client_code;
        this.server_name = obj.server_name;
        this.server_code = obj.server_code;

        this.is_ret = obj.is_ret;
        this.linked_diagram_uid = obj.linked_diagram_uid;
        this.infoMessages = obj.infoMessages;
        this.sequence = obj.sequence;
    }
}


const find_method = (uid, app) => {
    if (!(uid && app)) return null;

    for (const api of app.interfaces ?? []) {
        for (const method of api.methods ?? []) {
            if (uid === method.uid) {
                return method;
            }
        }
    }
    return null;
}
export class ScenarioMessage extends ScenarioMessageDTO {
    /**@type {ScenarioApplicationDTO} */
    #server;
    get server() {
        return this.#server;
    }
    #client;
    /**@type {ScenarioApplicationDTO} */
    get client() {
        return this.#client;
    }
    /**
     *
     */
    constructor(obj, app_map = {}) {
        super(obj);
        this.#client = app_map[this.client_code];

        this.#server = app_map[this.server_code];
        if (this.sequence)
            this.sequence = this.sequence.map(m => new ScenarioMessage(m, app_map));
        this.method = find_method(this.operation_guid, this.#server);
    }
    get sla() {
        return this.rps && this.latency && this.error_rate && ["rps", "latency", "error_rate"].filter(k => this[k]).map(k => `${k}=${this[k]}`).join(";")
    }
    get title() {
        return `${this.client_code?? this.client_name}->${this.server?.title ?? this.server_code ?? this.server_name}${this.stereotype ? ` ${this.stereotype}` : ""}:${this.method?.name ?? this.name} ${this.sla || ""}`;
    }

}