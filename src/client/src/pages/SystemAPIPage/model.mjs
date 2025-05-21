export class ApiMethod{
    name;
    rps;
    latency;
    error_rate;
    apiInterface;
    containerInfo;
    implementsTC;
    apiImplementsTC;
    constructor(method) {
        Object.assign( this, method);
    }
    get sla(){
        const sla = []
        if( this.rps) sla.push(`rps=${this.rps}`);
        if( this.latency) sla.push(`latency=${this.rps}`);
        if( this.error_rate) sla.push(`error_rate=${this.rps}`);
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
