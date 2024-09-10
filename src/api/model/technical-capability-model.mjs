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

    parents = [];
    children;
    system;

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
        this.system = {
            code: cap.sys_code,
            name: cap.sys_name,
            href: buildHREF(`${SYSTEM_LIST_RESOURCE}/${encodeURIComponent(cap.sys_code)}`)
        }
    }
    addParent(s) {
        (this.parents = this.parents ?? []).push({ ...s, href: buildHREF(`${CAPABILITY_LIST_RESOURCE}/${encodeURIComponent(s.code)}`) });
    }
}


export default TechnicalCapability;