class TechnicalCapability {
    code;
    name;
    description;
    author;
    createdDate;
    modifiedDate;
    status;
    parents = [];
    owner;
    children;
    constructor(cap) {
        if (!cap) return;
        cap.parents = cap.parents ?? [];
        for (const prop in this) {
            this[prop] = cap[prop] ?? undefined;
        }
    }
    async getTechnicalCapabilities(request, response) {
        try {
            throw Error('not implemented');
        } catch (err) {
            console.error(err);
            response.status(500).send(err.message);
        }
    }
}


export default TechnicalCapability;