import {
    REALIZATION_CONNECTOR,
    SparxRepository,
    t_object,
    t_objectproperties
} from '../sparx-ea-repository/index.mjs';

import { NotFound, NotImplemented } from '../../../utils/errors.mjs';
import { PREPARE_CONTAINERS_PACKAGE } from '../sql/system-container-sql.mjs';
import {
    SELECT_PROVIDED_API,
    SELECT_SYSTEM_CAPABILITIES,
    SELECT_SYSTEM_PARTICIPITION
} from './systems-queries.mjs';
import { SELECT_SYSTEM_CONTAINERS, SELECT_SYSTEM_CONTAINERS_BY_SYS_CODE } from './systems-containers-queries.mjs';
import { SystemDTO, SystemDTOInternal } from './model.mjs';
import { SparxRepositoryPackages as sparxOptions } from '../sparx-ea-repository/options.mjs';
import { CONTAINER_STEREOTYPE, CONTAINERS_SUBPACKAGE_NAME, DEFAULT_STATUS, INTERFACES_SUBPACKAGE_NAME, REMOVED_STATUS, SYSTEM_SUBPACKAGES as SYSTEM_SUBPACKAGES_NAMES } from './const.mjs';
import { SELECT_SYSTEMS, SELECT_SYSTEM_BY_CODE } from './queries/index.mjs';
import { SELECT_SYSTEM_PACKAGES, selectApplications } from './queries/select-systems.mjs';
import { SELECT_SYSTEM_CONTAINER_BY_CODE } from './queries/select-containers.mjs';
import { systemContext, SystemPackage } from './system-package.mjs';
import { Container, isContainersEquals } from '../../model/system.mjs';
import { InterfacesRepository } from '../index.mjs';
import { API_LOAD_DATE_TAG } from '../interfaces-repository/const.mjs';
import { KeyValueCache } from '../key-value-cache/index.mjs';
import { containerRepository } from './container-repository.mjs';


const Repository = new SparxRepository();


const loadApps = async () => {
    const app_map = {};
    const rows = await selectApplications();
    for (const row of rows) {
        const code = row.code.toLowerCase();
        const app = app_map[code] || (app_map[code] = new SystemDTOInternal(row));
    }
    return Object.values(app_map);
}

/**
 * Учет систем
 */
export class SystemsRepository {
    #appCache = new KeyValueCache({
        entity: "APP",
        key: "code",
        loadFn: loadApps
    });
    /** @type {SystemPackage} */
    packagesOptions;
    /** @type {InterfacesRepository} */
    interfaceRepository;

    constructor(packagesOptions, interfaceRepository) {
        this.packagesOptions = packagesOptions ?? (new SystemPackage());
        this.interfaceRepository = interfaceRepository ?? (new InterfacesRepository());
    }
    /**
     * Получение информации о системам
     * @returns {Promise<Array<SystemDTO>>}
     */
    async selectSystems() {
        return this.#appCache.all();
    }
    /**
     * 
     * @returns {Promise<SystemDTO | null>}
     */
    async selectSystemByCode(code) {
        return this.#appCache.byKey(code);
    }

    async prepareSystemPackages(code) {
        /** @type {{object_id, name:string, package_id, containers_package_id,interfaces_package_id}} */
        let systemPackages = await Repository.queryOne(SELECT_SYSTEM_PACKAGES, [code]);
        if (!systemPackages) throw NotFound(`System with code=[${code}] not found`);

        if (!systemPackages.package_id) {
            console.info(`create system package (code="${code}", name="${systemPackages.name}"):`);
            const option = await sparxOptions.default();
            const pkg = await Repository.createPackage({
                parent_id: option.TechCapabilitiesCatalogue.package_id,
                name: systemPackages.name,
                alias: code.toUpperCase()
            });
            systemPackages.package_id = pkg.package_id;
        }

        if (!systemPackages.containers_package_id) {
            console.info(`create containers package (code="${code}", name="${systemPackages.name}"):`);

            const containerPackage = await Repository.createPackage({
                parent_id: systemPackages.package_id,
                name: CONTAINERS_SUBPACKAGE_NAME
            });
            systemPackages.containers_package_id = containerPackage.package_id;
        }

        if (!systemPackages.interfaces_package_id) {
            console.info(`create interfaces package (code="${code}", name="${systemPackages.name}"):`);

            const interfacesPackage = await Repository.createPackage({
                parent_id: systemPackages.package_id,
                name: INTERFACES_SUBPACKAGE_NAME
            });
            systemPackages.interfaces_package_id = interfacesPackage.package_id;
        }
        return systemPackages;
    }

    /**
     * @returns {Promise<Array<{ sys_code, sys_name, code, name, description, version, status}>>}
     */
    async selectSystemsContainers() {
        return containerRepository.all();
    }

    /**
     * 
     * @param {string} systemCode 
     * @returns {Promise<Array<{container_id, sys_code, sys_name, code:string, name, description,version, status}>>}
     */
    async selectSystemContainers(systemCode) {
        if (!systemCode) throw "systemCode==null";

        return Repository.queryRows(SELECT_SYSTEM_CONTAINERS_BY_SYS_CODE, [systemCode])
    }

    /**
     * 
     * @param {string} systemCode 
     * @param {string} containerCode 
     * @returns {Promise<{ container_id, code:string}>}>}
     */
    async selectSystemContainerByCode(systemCode, containerCode) {
        const rows = await Repository.query(SELECT_SYSTEM_CONTAINER_BY_CODE, systemCode, containerCode);
        if (rows.length > 1) throw Error(`Найдено несколько контейнеров с кодом ${containerCode} для системы ${systemCode}`);
        return rows.length && rows[0];
    }

    async selectContainerByCode(containerCode) {
        return Repository.first(t_object, { stereotype: "C4_Container", alias: containerCode })
            .then(r => r ? {
                code: r.alias,
                name: r.name,
                description: r.note,
                version: r.version
            } : null);
    }

    /**
     * 
     * @param {string} code 
     * @returns {Promise}
     */
    async selectSystemE2EParticipition(code) {
        return Repository.queryRows(`${SELECT_SYSTEM_PARTICIPITION} WHERE operation IS NOT NULL`, [code]);
    }

    /**
     * 
     * @param {string} systemCode 
     * @returns {Promise<{container_package_id, sys_package_id, sys_object_id}>}
     */
    async prepareContainerPackage(systemCode) {
        return Repository.queryOne(PREPARE_CONTAINERS_PACKAGE, [CONTAINERS_SUBPACKAGE_NAME, systemCode]);
    }

    async #insertContainer(system_id, container_package_id, name, code, author, version, description, status) {
        if (!system_id) throw Error("system_id==null");
        if (!container_package_id) throw Error("container_package_id==null");

        const container = await Repository.createObject({
            package_id: container_package_id,
            name: name,
            object_type: "Component",
            author: author,
            alias: code,
            version: version,
            note: description,
            status: status,
            stereotype: CONTAINER_STEREOTYPE,
            backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
        });

        await Repository.putConnector(system_id, container.object_id, 'Realisation');

        return { name: container.name, description: container.note, container_id: container.object_id, code: container.alias };
    }

    async setSystemContainers(systemCode, containers) {
        console.log(`${systemCode} - Обновление информации о контейнерах системы`);
        containers = containers ?? [];

        const systemPackages = await this.prepareSystemPackages(systemCode);

        const containersDiffMap = (await this.selectSystemContainers(systemCode)).reduce((cm, c) => ((cm[c.code] = { current: c }), cm), {});
        for (const tc of containers) {
            if (!tc.status) tc.status = DEFAULT_STATUS;
            const containerDiff = containersDiffMap[tc.code] ?? (containersDiffMap[tc.code] = {});
            containerDiff.target = tc;
            if (containerDiff.current) containerDiff.target.object_id = containerDiff.current.object_id;

            containerDiff.needUpdate = containerDiff.current && !isContainersEquals(containerDiff.current, tc);
        }

        // Не удаляем, а устанавливаем статус в удаленный
        Object.values(containersDiffMap).filter(c => !c.target && c.current.status !== REMOVED_STATUS).forEach(diff => {
            diff.target = diff.current;
            diff.target.status = REMOVED_STATUS;
            diff.needUpdate = true;
        });

        /** @type {Array<{current, target, needUpdate}>} */
        const containersToInsert = Object.values(containersDiffMap).filter(c => !c.current);
        const containersToUpdate = Object.values(containersDiffMap).filter(c => c.needUpdate);
        if (!containersToInsert.length && !containersToUpdate.length) {
            console.info(`${systemCode} - Обновление контейнеров не требуется`);
            return;
        }

        if (containersToInsert.length) console.log(`${systemCode} - add new containers:`, containersToInsert.map(c => c.target));

        const newContainers = [];

        for (const diff of containersToInsert) {
            const container = await this.#insertContainer(
                systemPackages.object_id,
                systemPackages.containers_package_id,
                diff.target.name,
                diff.target.code,
                diff.target.author,
                diff.target.version,
                diff.target.description,
                diff.target.status
            );
            diff.target.object_id = container.container_id;
            newContainers.push(container);
            console.info(`${systemCode} - добавлен контейнер `, container);
        }

        for (const diff of containersToUpdate) {
            await this.updateContainer(
                diff.current.object_id,
                diff.target.name,
                diff.target.code,
                diff.target.author,
                diff.target.version,
                diff.target.description,
                diff.target.status);

            console.log(`${systemCode} - Обновлен контейнер, status = [${diff.target.status}]`, diff.target)
        }
        console.log(`${systemCode} - Обновление контейнеров завершено`)
    }

    async updateContainer(container_id, name, code, author, version, description, status) {
        if (!container_id) throw Error('Container object_id is not specified');

        await Repository.updateObjectTags(container_id, { [API_LOAD_DATE_TAG]: new Date() });

        return Repository.update(t_object,
            {
                name: name,
                author: author,
                version: version,
                note: description,
                status: status,
                alias: code
            },
            { object_id: container_id });
    }

    /**
     * 
     * @param {string} systemCode Код приложения
     * @param {string} tagName 
     * @returns {Promise<t_objectproperties>}
     */
    async getSystemTag(systemCode, tagName) {
        const system = await this.selectSystemByCode(systemCode);
        return Repository.first(t_objectproperties, { object_id: system.object_id, property: tagName });
    }

    async setSystemTag(systemCode, tagName, tagValue) {
        const system = await this.selectSystemByCode(systemCode);
        return Repository.updateObjectTags(system.object_id, { [tagName]: tagValue }, [tagName])
    }

    /**
     * 
     * @returns {Promise}
     */
    async selectSystemCapabilities(code) {
        return Repository.queryRows(SELECT_SYSTEM_CAPABILITIES, [code]);
    }

    /**
     * 
     * @param {string} systemCode 
     * @returns {Promise<Array<{name:string,code:string, ea_guid, object_id,method_name:string, method_uid:string,method_description,rps,latency,error_rate}>>}
     */
    async selectProvidedApi(systemCode) {
        return Repository.query(SELECT_PROVIDED_API, systemCode);
    }

    async deleteSystemContainer(systemCode, { code: containerCode, container_id }) {
        return Repository.transactionScope(async () => {
            if (!systemCode) throw Error("systemCode==null");
            if (!containerCode) throw Error("containerCode==null");

            if (!container_id) {
                const container = await this.selectSystemContainerByCode(systemCode, containerCode);
                if (!container) throw Error(`Контейнер не найден (systemCode=${systemCode}, containerCode=${containerCode})`);
                container_id = container.container_id;
            }
            await this.interfaceRepository.deleteContainerInterfaces(container_id);
            /** @type {{system_id, package_id, containers_package_id, interfaces_package_id, root_id}} */
            const context = systemContext.getStore() ?? (await (new SystemPackage()).prepareSystemPackage());

            const canDelete = await Repository.canDeleteObject(container_id);
            if (canDelete) {
                await Repository.removeConnectors(context.system_id, container_id, REALIZATION_CONNECTOR);
                return Repository.deleteObject(container_id);
            }
            await Repository.update(t_object, { status: REMOVED_STATUS }, { object_id: container_id });
            return Repository.updateObjectTags(container_id, { [API_LOAD_DATE_TAG]: new Date() });
        });
    }

    /**
     * 
     * @param {string} systemCode 
     * @param {Container} container 
     */
    async addSystemContainer(systemCode, container) {
        return Repository.transactionScope(async () => {
            console.log(`Добавление контейнера ${container.code}`);

            const systemOption = await this.packagesOptions.prepareSystemPackage(systemCode);

            const c = await this.#insertContainer(systemOption.system_id,
                systemOption.containers_package_id,
                container.name, container.code, "FDM API", container.version, container.description, container.status ?? "Proposed"
            )
            container.container_id = c.container_id;
            const apiList = container.interfaces ?? [];
            for (const it of apiList) {
                await this.interfaceRepository.addContainerInterface(systemCode, container, it);
            }
        });
    }

    /**
     * 
     * @param {string} systemCode 
     * @param {Container} container 
     */
    async insertSystemContainer(systemCode, container) {
        return Repository.transactionScope(async () => {
            const systemOption = await this.packagesOptions.prepareSystemPackage(systemCode);

            const c = await this.#insertContainer(systemOption.system_id,
                systemOption.containers_package_id,
                container.name, container.code, "FDM API", container.version, container.description, container.status ?? "Proposed"
            )
            container.container_id = c.container_id;
            return container;
        });
    }
}


export const appRepository = new SystemsRepository();