import { buildHREF } from "../controllers/controller-decorator.mjs";
import { CAPABILITY_LIST_RESOURCE, SYSTEM_LIST_RESOURCE } from "../specifications/paths.mjs";

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

    /**
     * @type {Array<{code:string, href:string}>}
     */
    parents = [];
    children;
    system;

    /**
     * 
     * @param {{code: string, name, description, author, createdDate, modifiedDate, status, targetSystemCode, parents:[]}} cap 
     * @returns 
     */
    constructor(cap) {
        if (!cap) return;
        if( !cap.sys_code) throw Error( `Отсутсвтует код системы для TC ${JSON.stringify(cap)}`);

        for (const prop in this) {
            this[prop] = cap[prop] ?? undefined;
        }
        
        this.system = {
            code: cap.sys_code.toLowerCase(),
            name: cap.sys_name,
            href: buildHREF(`${SYSTEM_LIST_RESOURCE}/${encodeURIComponent(cap.sys_code)}`)
        }
    }
    addParent(s) {
        (this.parents = this.parents ?? []).push({ ...s, href: buildHREF(`${CAPABILITY_LIST_RESOURCE}/${encodeURIComponent(s.code)}`) });
        this.parents = this.parents.sort((a, b) => a.code.localeCompare(b.code));
    }
}


export default TechnicalCapability;