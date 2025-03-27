export class DiagramUsing {
    name;
    uid;
    constructor(name, uid) {
        this.name = name;
        this.uid = uid;
    }
}

export class DoubleMethod {
    uid;
    name;
    parameters;
    rps;
    latency;
    error_rate;
    removed_date;
    /** @type {DiagramUsing[]} */
    diagrams = [];
    constructor(uid, name, rps, latency, error_rate, removed_date,parameters) {
        this.uid = uid;
        this.name = name;
        this.parameters = parameters;
        this.rps = rps??undefined;
        this.latency = latency??undefined;
        this.error_rate = error_rate??undefined;
        this.removed_date = removed_date ?? undefined;
    }
}

export class DoublesInterface {
    name;
    uid;
    code;
    FQName;
    doubles = {};
    constructor(name, uid, code, fqname) {
        this.name = name;
        this.uid = uid;
        this.code = code;
        this.FQName = fqname;
    }
    addMethodDouble(uid, name, rps, latency, error_rate, diagram, diagram_uid, removed_date, parameters) {
        /** @type {DoubleMethod[]} */
        const methods = this.doubles[name.toLowerCase()] ?? (this.doubles[name.toLowerCase()] = []);
        let method = methods.find(m => m.uid === uid);
        if (!method)
            methods.push(method = new DoubleMethod(uid, name, rps, latency, error_rate, removed_date, parameters));
        if (diagram_uid) {
            const used = method.diagrams.find(d => d.uid === diagram_uid);
            if (!used)
                method.diagrams.push(new DiagramUsing(diagram, diagram_uid));
        }
    }
}