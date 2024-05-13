
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
        //this.relatedSystems = this.relatedSystems ?? cap.targetSystemCode ? [cap.targetSystemCode] : [];
    }
    addParent(s) {
        /*if (s === null)
            return;
            */
        (this.parents = this.parents ?? []).push(s);
    }
}


export default TechnicalCapability;