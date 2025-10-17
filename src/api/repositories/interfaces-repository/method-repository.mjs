import { KeyValueCache } from "../key-value-cache/index.mjs";
import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { SELECT_METHODS } from "./methods-queries.mjs";

class MethodEntity {
    app_code;
    container_code;
    container_id;
    interface_code;
    interface_id;
    name;
    operation_guid;
    returnType;
    description;
    error_rate;
    latency;
    rps;
    removed_date;
    implements;
    key;
}

/**
 * 
 * @returns {Promise<MethodEntity[]>}
 */
const loadMethods = async () => {
    /**@type  */
    const methods = await eaRepository.query(SELECT_METHODS)
    methods.forEach(m => m.key = `${m.interface_code}:${m.name}`);
    return methods;
}

export class MethodRepository {
    #cache = new KeyValueCache({
        entity: "Method",
        key: "key",
        loadFn: loadMethods,
        indexes: ["interface_code", "container_code", "app_code"]
    })
    /**
     * 
     * @param {string} code 
     * @returns {Promise<MethodEntity[]>}
     */
    async byInterfaceCode(code) {
        return this.#cache.byIndex("interface_code", code);
    }
    /**
     * 
     * @returns {Promise<MethodEntity[]>}
     */
    async all() {
        return this.#cache.all();
    }
}

export const methodRepository = new MethodRepository();