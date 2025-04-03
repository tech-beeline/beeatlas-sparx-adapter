export class Interaction2 {
    messages = [];
    server;
    client;
    method;
    index;
    stereotype;
    dependOn;
    constructor(server, client, method, index, stereotype, dependOn) {
        Object.assign(this, { server: server, client: client, method: method, index: index, stereotype: stereotype, dependOn: dependOn });
    }
    get title() {
        return `${this.index + 1}. ${this.client.cmdb} - ${this.server.cmdb}: ${this.method}${this.stereotype ? ` ${this.stereotype}` : ""}`;
    }
    addMessage(m) {
        this.messages.push(m);
    }
    get totalRps() {
        const rps = this.messages.filter(r => !isNaN(r.rps));
        return rps.length ? rps.reduce((acc, v) => acc + v.rps ?? 0, 0) : null;
    }
    get notDefinedRPSCount() {
        return this.messages.filter(r => isNaN(r.rps)).length
    }
    get maxLatency() {
        const ll = this.messages.filter(m => !isNaN(m.latency));
        return ll.length > 0 ? Math.max(...ll.map(m => m.latency)) : null
    }
    get notDefinedLatencyCount() {
        return this.messages.filter(m => isNaN(m.latency)).length;
    }
    get minErrorRate() {
        const l = this.messages.filter(m => !isNaN(m.errorRate));
        return l.length > 0 ? Math.min(...l.map(m => m.errorRate)) : null;
    }
    get notDefinedErrorCount() {
        return this.messages.filter(m => isNaN(m.errorRate)).length;
    }
    get notDefinedIACount() {
        return this.messages.filter(m => !m.interfaceAgreement).length
    }
    get validationErrorCount() {
        console.log(this.messages)
        return this.messages.some(m => m.validationError?.length)
    }
}

class Interaction {
    title;
    client_code;
    server_code;
    name;
    messages = [];
    order;
    protocol;
    constructor(obj = {}) {
        this.title = obj.title;
        this.client_code = obj.client_code;
        this.server_code = obj.server_code;
        this.name = obj.name;
        this.order = obj.order;
        this.protocol = obj.method?.protocol;
    }
    get notDefinedIACount() {
        return this.messages.filter(m => !(m.ia && m.ia.content)).length
    }
    get totalRPS() {
        const rps = this.messages.filter(r => !isNaN(r.rps));
        return rps.length ? rps.reduce((acc, v) => acc + v.rps ?? 0, 0) : null;
    }
    get notDefinedRPSCount() {
        return this.messages.filter(r => isNaN(r.rps)).length
    }
    get maxLatency() {
        const ll = this.messages.filter(m => !isNaN(m.latency));
        return ll.length > 0 ? Math.max(...ll.map(m => m.latency)) : null
    }
    get notDefinedLatencyCount() {
        return this.messages.filter(m => isNaN(m.latency)).length;
    }
    get minErrorRate() {
        const l = this.messages.filter(m => !isNaN(m.errorRate));
        return l.length > 0 ? Math.min(...l.map(m => m.errorRate)) : null;
    }
    get notDefinedErrorCount() {
        return this.messages.filter(m => isNaN(m.errorRate)).length;
    }
}

export function tryParseFloat(n) {
    if (!n) return Number.NaN;
    if (typeof n === "string") {
        n = n.replace(',', '.')
    }
    return Number(n);
}

const RPS_DIMENTIONS = {
    second: (value) => value
}

const LATENCY_DIMENTIONS = {
    second: (value) => value * 1000
}
function getIaRPS(ia) {
    if (ia?.agreementTemplateVersion) {
        const requests = ia.loadProfile?.requests;
        if (!requests) return null;
        return RPS_DIMENTIONS[requests.dimension]?.(requests.value) ?? requests.value
    }
}

function getIaLatency(ia) {
    if (ia?.agreementTemplateVersion) {
        const latency = ia.loadProfile?.responseDelayMax;
        if (!latency) return null;
        const value = tryParseFloat(latency.value);
        return LATENCY_DIMENTIONS[latency.dimension]?.(value) ?? value
    }
}

function getIaErrorRate(ia) {
    if (ia?.agreementTemplateVersion) {
        return tryParseFloat(ia.loadProfile?.errorPercentage);
    }
}

function parseIA(message) {
    const ia = message.interfaceAgreement?.yaml
    message.iaRPS = getIaRPS(ia);
    message.iaLatency = getIaLatency(ia);
    message.iaErrorRate = getIaErrorRate(ia);
}


export class Scenario {
    applications;
    messages;
    interactions = {};
    #interactionCount = 0;
    name;
    processUID;
    info;
    callTrace;

    constructor({ applications, messages, name, processUID, info, callTrace } = {}) {
        this.applications = applications;
        this.messages = messages;
        this.name = name;
        this.processUID = processUID
        this.info = info;
        this.callTrace = callTrace;
        this.#buildInteractions(callTrace)
    }

    applicationByRef(ref) {
        if (ref && ref.startsWith('#')) {
            return ref.split('/').slice(1).reduce((acc, v) =>
                acc ? acc[v] ?? null : null, this);
        }
        return null;
    }

    #setInvalidChild(context, child) {
        if (!context) return;
        (context.invalidChildren ?? (context.invalidChildren = [])).push(child);
        this.#setInvalidChild(context.getParent(), child);
    }

    #buildInteractions(messages, context) {
        for (let m of messages) {
            m.getParent = () => context;

            if (m.client_code && m.server_code && m.name) {
                m.rps = tryParseFloat(m.rps);
                m.latency = tryParseFloat(m.latency);
                if (m.latency && !isNaN(m.latency)) m.latency *= 1000;
                m.errorRate = tryParseFloat(m.error_rate)
                m.stackTrace = context ? [...context.stackTrace ?? [], `${m.seqno} [${m.server_code ?? ""}]${m.server_name} [${m.name}]`] : context?.stackTrace ?? [];

                const title = `${m.client_code}->${m.server_code}: ${m.name}${m.stereotype ? ` ${m.stereotype}` : ""}`
                const interaction = this.interactions[title] ?? (this.interactions[title] = new Interaction(Object.assign({ title: title, order: ++this.#interactionCount }, m)))
                let exisiting = interaction.messages.find(i => i.ea_guid === m.ea_guid);
                if (!exisiting) {
                    interaction.messages.push(exisiting = Object.assign({ contexts: [] }, m));
                }
                exisiting.contexts.push(m.stackTrace);
            }
            if (m.errors) this.#setInvalidChild(context, m);

            if (m.children) {
                this.#buildInteractions(m.children, m);
            }
        }
    }
}