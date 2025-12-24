export class TCDto {
    object_id;
    /**@type {string} */
    code;
    parentCodes = [];
    domain_code;
    name;
    description;
    author;
    status;
    version;
    createdDate;
    modifiedDate;
    owner;
    goal_to;
    goal_from;
    /**@type {string} */
    sys_code;
    /**
     * 
     * @param {TCDto} data 
     * @returns 
     */
    constructor(data) {
        if (!data) return;
        for (const prop in this) {
            this[prop] = data[prop] ?? undefined;
        }
    }
    addParentCode(code) {
        if (!this.parentCodes) this.parentCodes = [];
        if (this.parentCodes.find(c => c === code)) return;
        this.parentCodes.push(code);
    }
    removeParentCode(code) {
        if (!this.parentCodes) return;
        this.parentCodes = this.parentCodes.filter(c => c.toLowerCase() !== code.toLowerCase());
    }
}