import { ScenarioApplicationDTO } from "./scenario-application-dto.mjs";

export class ScenarioMethodDTO {
    name;
    uid
    api_id;
    show_in_e2e;
    rps;
    latency;
    error_rate;
    /**@type  {MethodMapRecord[]} */
    structurizr_map;
    #api;
    constructor(obj) {
        this.uid = obj.operation_guid;
        this.name = obj.method;
        this.api_id = obj.api_id;
        this.rps = obj.rps;
        this.latency = obj.latency;
        this.error_rate = obj.error_rate;
        this.show_in_e2e = obj.show_in_e2e || undefined;
        this.structurizr_map = this.structurizr_map;
    }
    set api(api) {
        this.#api = api;
    }
    get api() {
        return this.#api;
    }
}


export class ScenarioMessageDTO {
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

    constructor(obj) {
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

export class ScenarioMessage extends ScenarioMessageDTO {
    #server;
    /**@type {ScenarioApplicationDTO} */
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
    }
    get sla() {
        return ["rps", "latency", "error_rate"].filter(k => this[k]).map(k => `${k}=${this[k]}`).join(";")
    }
    get title() {
        return `${this.server?.title ?? this.server_name}:${this.name} ${this.sla}`;
    }

}