import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { t_object } from "../sparx-ea-repository/index.mjs";
import { selectInterfaceMethods } from "../systems-repository/queries/select-methods.mjs";
import { mergeClassifiers, mergeConnectors, mergeDiagramObjects, mergeObjectTags } from "./queries/merge.mjs";


export async function mergeMethod(method, source) {
    await eaRepository.query(`UPDATE t_connectortag 
        SET value=$1 
        WHERE property='operation_guid' AND value=$2`, method.ea_guid, source.ea_guid);

    return eaRepository.deleteOperation(source.operationid);
}

export async function mergeObject(target_id, source_id) {
    if (!target_id) throw Error(`target_id is not specified`);
    if (!source_id) throw Error(`source_id is not specified`);

    /** @type {[t_object, t_object]} */
    const [target, source] = await Promise.all([
        eaRepository.first(t_object, { object_id: target_id }),
        eaRepository.first(t_object, { object_id: source_id })
    ]);

    if (!target) throw Error(`target not found`);
    if (!source) throw Error(`source not found`);

    await Promise.all([
        mergeClassifiers(target, source),
        mergeConnectors(target, source),
        mergeDiagramObjects(target, source),
        mergeObjectTags(target, source)
    ]);
    return eaRepository.deleteObject(source_id);
}

export async function mergeInterface(target, source_id) {
    if (target.interface_id == source_id) return;

    const target_methods = await eaRepository.query('SELECT * FROM t_operation WHERE object_id=$1', target.interface_id);
    const source_methods = await eaRepository.query('SELECT * FROM t_operation WHERE object_id=$1', source_id);


    const methods = []
    for (const source_method of source_methods) {
        if (!source_method.name) continue;

        const method = target_methods.find(m => m.name.toLowerCase() === source_method.name.toLowerCase());
        if (method) {
            await mergeMethod(method, source_method);
            continue;
        }
        await eaRepository.query(`UPDATE t_operation SET object_id=$1 WHERE operationid=$2`, target.interface_id, source_method.operationid);
    }
    await mergeObject(target.interface_id, source_id);
    target.methods = await selectInterfaceMethods();
}