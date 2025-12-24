export class ApiMethod {
    name;
    rps;
    latency;
    error_rate;
    apiInterface;
    containerInfo;
    implements;
    apiImplements;
    constructor(method) {
        Object.assign(this, method);
    }
    get sla() {
        const sla = []
        if (this.rps) sla.push(`rps=${this.rps}`);
        if (this.latency) sla.push(`latency=${this.latency}`);
        if (this.error_rate) sla.push(`error_rate=${this.error_rate}`);
        return sla.join(';')
    }
}

export class ApiInterface {
    name;
    code;
}

export class SystemApi {
    /** @type {string} */
    code;
    /** @type {string} */
    name;
}

export class ProvidedAPIMethod {
    name;
    rps;
    latency;
    error_rate;
    get sla() {
        const sla = []
        if (this.rps) sla.push(`rps=${this.rps}`);
        if (this.latency) sla.push(`latency=${this.latency}`);
        if (this.error_rate) sla.push(`error_rate=${this.error_rate}`);
        return sla.join(';')
    }
    c4Methods = [];
    /**
     *
     */
    constructor(m) {
        Object.assign(this, m);
    }
}
export class ProvidedAPI {
    /** @type {string} */
    name;
    /** @type {string} */
    ea_guid;
    /** @type {Array<ProvidedAPIMethod>} */
    methods = [];
    /**
     *
     */
    constructor(obj) {
        Object.assign(this, obj);
        this.methods = obj.methods.map(m => new ProvidedAPIMethod(m))
    }
}


/**
 * 
 * @param {ProvidedAPI[]} providedApiList 
 * @param {SystemApi[]} systemApi 
 */
export function chechApi(providedApiList, systemApi) {
    providedApiList.forEach(api => api.methods.forEach(m => {
        m.c4Methods = systemApi.filter(sm => sm.name.toLowerCase() == m.name.toLowerCase());
    }))
}