import { BadRequest, NotFound, NotImplemented } from "../../../utils/errors.mjs";
import { KeyValueCache } from "../key-value-cache/index.mjs";
import eaRepository, { ARCHIMATE_AGGREGATION } from "../sparx-ea-repository/ea-repository.mjs";
import { CapabilityDTO, CapabilityDTOInternal } from "./model.mjs";

import { capabilityAttributesEquals } from "./utils/index.mjs";
import { CapabilityBaseDTO, DomainDTO } from "./model/index.mjs";
import { loadCapabilities } from "./load-capabilities.mjs";
import { BC_PACKAGE_NAME } from "./consts.mjs";
import { ARCHIMATE_CAPABILITY, t_object, t_package } from "../sparx-ea-repository/index.mjs";
import { arrangeDomainDiagramObjects } from "./arrange-domain-objects.mjs";
import { ownersRepository } from "./owners-catalogue.mjs";


class BCRepository {

    #cache = new KeyValueCache({
        key: "code",
        entity: "bc",
        loadFn: loadCapabilities
    });
    /**
     * 
     * @returns {Promise<CapabilityDTOInternal>}
     */
    async all() {
        return this.#cache.all();
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<CapabilityBaseDTO>}
     */
    async byCode(code) {
        return this.#cache.byKey(code);
    }

    /**
     * 
     * @param {DomainDTO} domain 
     * @returns {Promise<DomainDTO>}
     */
    async createDomain(domain) {
        if (!domain.parent_code)
            throw Error(`Не указан код родительского домена (parent_code)`);
        const parent = await this.byCode(domain.parent_code);
        if (!parent) throw Error(`Возможность с кодом ${domain.parent_code} не найден`);
        if (!parent.isDomain)
            throw BadRequest(`Возможность с кодом ${parent.code} не является доменом`);

        console.log(`Создаем домен ${domain.code}`);

        const new_package = await eaRepository.createPackage({
            parent_id: parent.package_id,
            name: domain.name,
            alias: domain.code,
            notes: domain.description,
            status: domain.status,
            author: domain.author
        });
        domain = new DomainDTO({
            name: domain.name,
            isDomain: true,
            code: domain.code,
            author: domain.author,
            status: domain.status,
            createdDate: new_package.createddate,
            description: domain.description,
            package_id: new_package.package_id,
            object_id: new_package.object_id
        });
        domain.setParent(parent);
        console.log(`Домен ${domain.code} создан`);
        return domain;
    }

    /**
     * 
     * @param {CapabilityBaseDTO} capability 
     * @returns {Promise<CapabilityBaseDTO>}
     */
    async createBC(capability) {
        if (!capability.parent_code)
            throw Error(`Не указан код родительской возможности`);
        const parent = await this.byCode(capability.parent_code);
        if (!parent) throw Error(`Возможность с кодом ${capability.parent_code} не найден`);
        const domain = parent.domain;
        if (!domain) throw Error(`не найден домен у родительской возможности`);

        if (!domain.bcPackageId) {
            console.log(`Не найдена папка "BC" у домена ${domain}, создаем...`);
            const bc_package = await eaRepository.createPackage({
                parent_id: domain.package_id,
                name: BC_PACKAGE_NAME
            });
            domain.bcPackageId = bc_package.package_id;
            console.log(`Создана папка package_id=${bc_package.package_id},\n\t object_id=${bc_package.object_id}, ea_guid=${bc_package.ea_guid}`);
        }

        const obj = await eaRepository.createObject({
            package_id: domain.bcPackageId,
            name: capability.name,
            author: capability.author,
            status: capability.status,
            note: capability.description,
            aslias: capability.code,
            object_type: ARCHIMATE_CAPABILITY
        });

        const connector = await eaRepository.putConnector(
            parent.object_id,
            obj.object_id,
            ARCHIMATE_AGGREGATION);

        const result = new CapabilityBaseDTO(
            {
                ...capability,
                object_id: obj.object_id,
                package_id: domain.bcPackageId,
                isDomain: false
            });
        result.setDomain(domain);
        result.setParent(parent);

        arrangeDomainDiagramObjects(domain);

        return result;
    }

    /**
     * 
     * @param {CapabilityBaseDTO} capability 
     * @returns {Promise<CapabilityBaseDTO>}
     */
    async create(capability) {
        return capability.isDomain ? this.createDomain(capability) : this.createBC(capability);
    }

    async chechExisits(capability) {
        const r = await eaRepository.first(t_object, { object_id: capability.object_id });
        if (!r) {
            this.#cache.updateValue(capability.code, null);
            return false;
        }
        return true;
    }
    /**
     * 
     * @param {DomainDTO} domain 
     * @param {DomainDTO} current
     * @returns {Promise<CapabilityBaseDTO>}
     */
    async updateDomain(domain, current) {
        if (capabilityAttributesEquals(domain, current)
            && domain.parent_code?.toLowerCase() == current.parent_code?.toLowerCase()) {
            console.log(`Обновление атрибутов для домена ${domain.code} не требуется`);
            return current;
        }
        console.log(`Обновление данных о домене ${domain.code}`);

        const pkg_data = {
            name: domain.name,
            notes: domain.description
        };

        const parent = await this.byCode(domain.parent_code);
        if (!parent)
            throw Error(`не найден целевой родительской домен ${domain.parent_code}`);

        if (domain.parent_code !== current.parent_code) {
            if (parent.hasParent(domain.code))
                throw Error(`У домена ${domain.code} в дочерних доменах найден целевой родительский домен (${parent.code})\nЭто приведет к циклическим зависимостям`);
            console.log(`Меняем родительской домен для ${domain.code} (${current.parent_code}->${domain.parent_code})`);
            pkg_data.parent_id = parent.package_id;
        }

        /**@type {t_package[]} */
        const [pkg] = await eaRepository.update(t_package,
            pkg_data,
            { package_id: current.package_id });

        /** @type {t_object[]} */
        const [obj] = await eaRepository.update(t_object,
            {
                name: domain.name,
                note: domain.description,
                status: domain.status,
                author: domain.author
            },
            { object_id: current.object_id }
        );
        current.name = obj.name;
        current.author = obj.author;
        current.status = obj.status;
        current.description = obj.note;

        if (domain.parent_code !== current.parent_code) {
            current.setParent(parent);
        }
        return current;
    }

    async update(capability, current) {
        return capability.isDomain ? this.updateDomain(capability, current) : NotImplemented()
    }

    /**
     * 
     * @param {CapabilityBaseDTO} capability 
     */
    async put(capability) {
        const current = await this.byCode(capability.code);
        const result = current ? await this.update(capability, current) : await this.create(capability);
        return this.#cache.updateValue(capability.code, result);
    }

    async setCapabilityOwner(code, owner) {

        const capability = await this.byCode(code);
        if (!capability) throw NotFound(`Capability with code=${code} not found`);

        if (capability.owner?.toLowerCase() === owner?.toLowerCase()) {
            console.log(`Изменение владельца для ИС [${code}] не требуется`);
            return;
        }

        console.info(`Изменение владельца для BC (code="${code}") на ${owner}`);

        if (capability.owner) {
            console.log(`Удаляем связи ${code} с ${capability.owner}`);

            const currentOwners = await ownersRepository.selectByName(capability.owner);
            for (const o of currentOwners) {
                await eaRepository.removeConnectors(o.object_id, capability.object_id, UML_RESPONSIBILITY);
            }
        }

        if (owner?.length) {
            console.log(`Добавляем связь ${code} с владельцем ${owner}`);
            const actors = await ownersRepository.selectByName(owner);
            const actor = actors.length ? actors[0] : (await ownersRepository.insertOwner(owner));
            await eaRepository.putConnector(actor.object_id, capability.object_id, UML_RESPONSIBILITY);
            console.log(`Cвязь ${code} с владельцем ${owner} добавлена`);
        }
    }
    invalidateCache(){
        this.#cache.invalidate();
    }
}

export const bcRepository = new BCRepository();