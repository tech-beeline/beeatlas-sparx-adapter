export class Message{
    message;
    /**
     * @type { { $ref}}
     */
    server;
    client;
    /**
     * @type {Array<Message>}
     */
    messages;
}
export class BusinessInteraction {
    name;
    /**
     * @type {Array<Message>}
     */
    scenario;
    uid;
    constructor(obj = {}) {
        for (const k in this) {
            this[k] = obj[k] ?? this[k];
        }
    }
}