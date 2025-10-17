import { Container } from "../../model/system.mjs";
import { KeyValueCache } from "../key-value-cache/index.mjs";
import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { SELECT_SYSTEM_CONTAINERS } from "./systems-containers-queries.mjs";


class ContainerEntity {
    sys_code;
    sys_name;
    code;
    name;
    description;
    version;
    status;
    object_id;
    container_id;
}
async function loadContainers() {
    return eaRepository.query(SELECT_SYSTEM_CONTAINERS);
}

class ContainerRepository {
    #data = new KeyValueCache({
        entity: "Container",
        key: "code",
        loadFn: loadContainers,
        indexes: ["sys_code"]
    });
    /**
     * 
     * @returns {Promise<ContainerEntity[]>}
     */
    async all() {
        return this.#data.all();
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<ContainerEntity>}
     */
    async byCode(code) {
        return this.#data.byKey(code);
    }
    async bySystemCode(code) {
        return this.#data.byIndex("sys_code", code);
    }
}

export const containerRepository = new ContainerRepository();