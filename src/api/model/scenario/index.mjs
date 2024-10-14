export class ScenarioMessage {
    consumer;
    supplier;
    name;
    stereotype;
    constructor(obj) {
        for (const prop in this) {
            this[prop] = obj[prop] ?? undefined;
        }
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