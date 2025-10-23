import { Container } from "../../../model/system.mjs";

/**
 * 
 * @param {{sys_code, sys_name, code:string, name, description,version, status}[]} existing 
 * @param {Container[]} target 
 * @returns {[newContianers:Container[], outdate: { code:string}[], existing: { exists:Container, 
 *      target:{sys_code, sys_name, code:string, name, description,version, status} }[]]}
 */
export function compareContainers(existing, target) {
    const result = {}
    for (const c of existing) {
        result[c.code.toLowerCase()] = { exists: c };
    }
    for (const c of target) {
        const diff = result[c.code.toLowerCase()] ?? (result[c.code.toLowerCase()] = {});
        diff.target = c;
    }
    /** @type {{exists, target}[]} */
    const diffList = Object.values(result)
    return [
        diffList.filter(d => !d.exists).map(d => d.target),
        diffList.filter(d => !d.target).map(d => d.exists),
        diffList.filter(d => d.target && d.exists)
    ]
}