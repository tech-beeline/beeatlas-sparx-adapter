
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
    version;
    goal_from;
    goal_to;
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
        if( cap.object_id ){
            this.object_id = ()=>cap.object_id;
        }
    }
    addParent(s) {
        /*if (s === null)
            return;
            */
        (this.parents = this.parents ?? []).push(s);
    }
}


export default TechnicalCapability;