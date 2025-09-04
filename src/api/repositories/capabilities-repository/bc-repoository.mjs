import { KeyValueCache } from "../key-value-cache/index.mjs";
import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { domainsRepositoryInstance } from "./domains-repository.mjs";
import { CapabilityDTOInternal } from "./model.mjs";
import { SELECT_BC } from "./queries/index.mjs";

class BCRepository {
    async #loadAll() {
        const rows = await eaRepository.query(SELECT_BC);
        const bc_map = {};
        const domains_map =await  domainsRepositoryInstance.map();
        let [to_insert, remains] = rows.reduce((acc, v) => {
            if (!v.code || !v.code.length) return acc;
            if (domains_map[v.parent?.toLowerCase()])
                acc[0].push(v);
            else
                acc[1].push(v);
            return acc;
        }, [[], []]);

        while (to_insert.length) {
            for (const bc of to_insert)
                bc_map[bc.code.toLowerCase()] = new CapabilityDTOInternal(bc);
            [to_insert, remains] = remains.reduce((acc, bc) => {
                if (bc_map[bc.parent?.toLowerCase()])
                    acc[0].push(bc);
                else
                    acc[1].push(bc);
                return acc;
            }, [[], []])
        }
        return Object.values(bc_map);
    }
    #cache = new KeyValueCache({
        key: "code",
        entity: "bc",
        loadFn: this.#loadAll
    });
    /**
     * 
     * @returns {Promise<CapabilityDTOInternal>}
     */
    async all() {
        return this.#cache.all();
    }
    async byCode(code) {
        return this.#cache.byKey(code);
    }
    async put(domain) {
        NotImplemented();
    }
}

export const bcRepository = new BCRepository();