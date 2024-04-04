
class TechnicalCapability {
    static STEREOTYPE = 'ArchiMate_TechnicalCapability';
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
    targetSystemCode;
    /**
     * 
     * @param {{code, name, description, author, createdDate, modifiedDate, status, targetSystemCode, parents:[]}} cap 
     * @returns 
     */
    constructor(cap) {
        if (!cap) return;
        //cap.parents = cap.parents ?? [];
        for (const prop in this) {
            this[prop] = cap[prop] ?? undefined;
        }
    }
}


export default TechnicalCapability;