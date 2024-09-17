/**
 * 
 * @param {Array} target 
 * @param {Array} current 
 * @param {(item)=>{}} keyFn 
 * @param {(targetItem)=>Promise<void>} addFn 
 * @param {(currentItem, targetItem)=>Promise<void>} updateFn 
 * @param {(currentItem)=>Promise<void>} removeFn 
 */
export default async function patchArray(
    target,
    current,
    keyFn,
    addFn,
    updateFn,
    removeFn
) {
    const diffMap = target.reduce((acc, i) => (acc[keyFn(i)] = { target: i }, acc), {});
    current.forEach(c => { (diffMap[keyFn(c)] ?? (diffMap[keyFn(c)] = {})).current = c });
    /**
     * @type {Array<{ current, target}>}
     */
    const diff = Object.values(diffMap);
    if (addFn) {
        for (const item of diff.filter(i => !i.current)) {
            await addFn(item.target);
        }
    }
    if (updateFn) {
        for (const item of diff.filter(i => i.current && i.target)) {
            await updateFn(item.current, item.target);
        }
    }
    if (removeFn) {
        for (const item of diff.filter(i => !i.target)) {
            await removeFn(item.current);
        }
    }
}