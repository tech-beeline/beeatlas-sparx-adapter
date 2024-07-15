export class Interaction {
    messages = [];
    server;
    client;
    method;
    index;
    stereotype;
    constructor(server, client, method, index, stereotype) {
        Object.assign(this, { server: server, client: client, method: method, index: index , stereotype : stereotype});
    }
    get title() {
        return `${this.index + 1}. ${this.client.cmdb} - ${this.server.cmdb}: ${this.method}${this.stereotype ? ` ${this.stereotype}` : ""}`;
    }
    addMessage(m) {
        this.messages.push(m);
    }
    get totalRps() {
        const rps = this.messages.filter(r => !isNaN(r.rps));
        return rps.length?rps.reduce((acc, v) => acc + v.rps ?? 0, 0):null;
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
    get notDefinedIACount(){
        return this.messages.filter( m=>!m.interfaceAgreement).length
    }
    get validationErrorCount(){
        console.log( this.messages )
        return this.messages.some( m=>m.validationError?.length )
    }
}

class Message {
    #parent;
    server;
    client;
    method;
    init(scenario, parent) {
        this.#parent = parent;
    }
    get parent() {
        return this.#parent;
    }
}


function tryParseFloat(n){
    if( !n) return Number.NaN;
    if( typeof n === "string") {
        n = n.replace(',','.')
    }
    return Number(n);
}

export class Scenario {
    applications;
    messages;
    interactions = {};
    #interactionCount = 0;
    constructor({ applications, messages } = {}) {
        this.applications = applications;
        this.messages = messages;
        this.#buildInteractions(messages)
    }

    applicationByRef(ref) {
        if (ref && ref.startsWith('#')) {
            return ref.split('/').slice(1).reduce((acc, v) =>
                acc ? acc[v] ?? null : null, this);
        }
        return null;
    }

    #buildInteractions(messages, context) {
        for (let m of messages) {
            m.server = this.applicationByRef(m.server?.$ref);
            m.client = this.applicationByRef(m.client?.$ref);
            m.getParent = () => context;
            m.stackTrace = m.type !== 'internalCall' && context ? `${context.stackTrace ?? ""}->${m.server?.cmdb ?? m.server_name}[${m.message}]` : context?.stackTrace;
            m.rps = tryParseFloat(m.rps);
            m.latency = tryParseFloat(m.latency)
            m.errorRate = tryParseFloat(m.errorRate)

            if (m.client && m.server && m.method) {
                const title = `${m.client.cmdb} - ${m.server.cmdb}: ${m.method} ${m.stereotype ? ` ${m.stereotype}` : ""}`;
                /** @type {Interaction} */
                const interaction = this.interactions[title] ?? (this.interactions[title] = new Interaction(m.server, m.client, m.method, this.#interactionCount++, m.stereotype));
                interaction.addMessage(m)
            }
            if (m.messages) {
                this.#buildInteractions(m.messages, m);
            }
        }
    }
}