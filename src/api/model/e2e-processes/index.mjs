

export class E2EProcess {
    uid;
    name;
    version;
    links;
    constructor(obj) {
        for (const prop in this) {
            this[prop] = obj[prop] ?? undefined;
        }
    }
}