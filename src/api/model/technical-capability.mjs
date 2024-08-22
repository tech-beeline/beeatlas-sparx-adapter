
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

        for (const prop in this) {
            this[prop] = cap[prop] ?? undefined;
        }

        // [ ] отрефакторить, что бы не было ссылки на идентификатор элемента в ЕА
        if( cap.object_id ){
            this.object_id = ()=>cap.object_id;
        }
    }
    addParent(s) {
        (this.parents = this.parents ?? []).push(s);
    }
}


export default TechnicalCapability;