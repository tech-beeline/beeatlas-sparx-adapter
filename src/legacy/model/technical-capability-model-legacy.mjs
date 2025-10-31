
class TechnicalCapability {
    static STEREOTYPE = 'ArchiMate_TechnicalCapability';
    code;
    name;
    description;
    author;
    createdDate;
    modifiedDate;
    owner;
    status;
    version;
    goal_from;
    goal_to;

    parents = [];
    children;
    targetSystemCode;

    /**
     * 
     * @param {{code, name, description, author, createdDate, modifiedDate, status, targetSystemCode, parents:[], sys_code}} cap 
     * @returns 
     */
    constructor(cap) {
        if (!cap) return;


        for (const prop in this) {
            this[prop] = cap[prop] ?? undefined;
        }

        if (cap.parentCodes)
            this.parents = cap.parentCodes;
        this.targetSystemCode = cap.sys_code;

        // [ ] отрефакторить, что бы не было ссылки на идентификатор элемента в ЕА
        if (cap.object_id) {
            this.object_id = () => cap.object_id;
        }
    }
    addParent(s) {
        (this.parents = this.parents ?? []).push(s);
    }
}

export default TechnicalCapability;