import { NotImplemented } from "../../../utils/errors.mjs";
import { mergeObject } from "../interfaces-repository/merge-interfaces.mjs";

export async function mergeContainers(target, source_id) {
    if( !source_id) throw Error('source_id is not specified');
    return mergeObject( target.container_id, source_id);
}