import { BadRequest, NotFound, NotImplemented } from "../../../utils/errors.mjs";
import { KeyValueCache } from "../key-value-cache/index.mjs";
import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { t_object, t_package } from "../sparx-ea-repository/index.mjs";
import { CapabilityDTOInternal } from "./model.mjs";
import { SELECT_DOMAINS } from "./queries/domain-queries.mjs";

class DomainsRepository {
    async #loadAll() {
        const rows = await eaRepository.query(SELECT_DOMAINS);
        return rows.filter(c => c.code && c.code.length).map(c => new CapabilityDTOInternal(c));
    }
    #cache = new KeyValueCache({
        key: "code",
        entity: "domain",
        loadFn: this.#loadAll
    });
    /**
     * 
     * @returns {Promise<CapabilityDTOInternal>}
     */
    async all() {
        return this.#cache.all();
    }
    async map() {
        return this.#cache.map();
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<CapabilityDTOInternal>}
     */
    async byCode(code) {
        return this.#cache.byKey(code);
    }
    /**
     * 
     * @param {CapabilityDTO} domain 
     */
    async put(domain) {
        const current = await this.byCode(domain.code);
        const parent = await this.byCode(domain.parent.code);
        if (!parent)
            throw NotFound(`не найдена родительская возможность с кодом ${domain.parent.code}`);
        if (!parent.isDomain)
            throw BadRequest(`у домена родитилем может быть только домен (попытка для домена ${domain.code} установить родитилем ${domain.parent.code})`);

        if (current) {
            if (current.name !== domain.name ||
                current.author !== domain.author ||
                current.status !== domain.status ||
                current.description !== domain.description) {

                console.log(`Вносим изменения в атриубуты домена code=${domain.code}, object_id=${current.object_id}`);

                const obj = await eaRepository.update(
                    t_object,
                    {
                        name: domain.name,
                        note: domain.description,
                        status: domain.status,
                        author: domain.author
                    },
                    {
                        object_id: current.object_id
                    });
                if (!obj.length)
                    throw Error(`Ошибка при обновлении t_object для object_id=${current.object_id}`);
                console.log(`Обновление t_object успешно, обновляем t_package`);
                await eaRepository.update(
                    t_package,
                    { name: domain.name, notes: domain.description },
                    { ea_guid: obj[0].ea_guid });
                console.log(`Обновление t_package успешно`);
            } else
                console.log('Обновление атрибутов не требуется');

            if (current.parent != domain.parent.code) {
                console.log(`Требуется изменение родителя, обновляем t_object`);
                const obj = await eaRepository.update(
                    t_object,
                    { package_id: parent.package_id },
                    { object_id: current.object_id });
                if (!obj.length)
                    throw Error(`Ошибка при обновлении t_object для object_id=${current.object_id}`);
                console.log(`t_object успешно обновлен, обновляем t_package`);
                await eaRepository.update(
                    t_package,
                    { parent_id: parent.package_id },
                    { ea_guid: obj[0].ea_guid });
                console.log(`t_package успешно обновлен`);
            }
            Object.assign(current, domain);
            current.parent = current.parent.code;
            return current;
        }

        const pkg = await eaRepository.createPackage({
            parent_id: parent.package_id,
            name: domain.name,
            alias: domain.code,
            notes: domain.description,
            status: domain.status,
            author: domain.author
        });
        const obj = await eaRepository.find(t_object, { ea_guid: pkg.ea_guid });
        domain.object_id = obj.object_id;
        domain.package_id = pkg.package_id;
        domain.parent = parent.code;
        return this.#cache.updateValue(domain.code, domain);
    }
}

export const domainsRepositoryInstance = new DomainsRepository();
