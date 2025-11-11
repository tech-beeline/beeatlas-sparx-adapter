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
import { CONTAINER_STEREOTYPE, CONTAINERS_SUBPACKAGE_NAME, DEFAULT_STATUS, INTERFACES_SUBPACKAGE_NAME, REMOVED_STATUS, SYSTEM_SUBPACKAGES as SYSTEM_SUBPACKAGES_NAMES, TC_SUBPACKAGE_NAME } from './const.mjs';
import { SELECT_SYSTEMS, SELECT_SYSTEM_BY_CODE, selectAllInterfaces, selectAllMethods } from './queries/index.mjs';
import { loadApps, SELECT_SYSTEM_PACKAGES, selectApplications } from './queries/select-systems.mjs';
import { SELECT_SYSTEM_CONTAINER_BY_CODE } from './queries/select-containers.mjs';
import { systemContext, SystemPackage } from './system-package.mjs';
import { Container, isContainersEquals } from '../../model/system.mjs';
import { interfaceRepository, InterfacesRepository } from '../index.mjs';
import { API_LOAD_DATE_TAG } from '../interfaces-repository/const.mjs';
import { KeyValueCache } from '../key-value-cache/index.mjs';
import { containerRepository } from './container-repository.mjs';
import eaRepository from '../sparx-ea-repository/ea-repository.mjs';
import { mergeContainers } from './merge-contianers.mjs';


const Repository = new SparxRepository();


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

    constructor(packagesOptions) {
        this.packagesOptions = packagesOptions ?? (new SystemPackage());
        this.interfaceRepository = interfaceRepository;
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

    /**
     * 
     * @param {string} code 
     * @returns {Promise<SystemDTOInternal>}
     */
    async byCode(code) {
        return this.#appCache.byKey(code);
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

    async insertContainer(system_id, container_package_id, name, code, author, version, description, status) {
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

    async updateContainer(container, name, code, author, version, description, status) {
        const container_id = container.container_id;
        if (!container_id) throw Error('Container object_id is not specified');

        await Repository.update(t_object,
            {
                name: name,
                author: author,
                version: version,
                note: description,
                status: status,
                alias: code
            },
            { object_id: container_id });

        if (container.doubles) {
            console.log(`ДУБЛИ КОНТЕЙНЕРОВ`);
            for (const d of container.doubles) {
                console.warn(`Объединяем ${d.container_id}`);
                await mergeContainers(container, d);
            }
        }


        await Repository.updateObjectTags(container_id, { [API_LOAD_DATE_TAG]: new Date() });
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
            const context = systemContext.getStore() ?? (await (new SystemPackage()).prepare());

            await Repository.removeConnectors(context.system_id, container_id, REALIZATION_CONNECTOR);

            const canDelete = await Repository.canDeleteObject(container_id);

            if (canDelete) {
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
            console.log(`${systemCode} : Добавление контейнера ${container.code}`);

            const app = await this.selectSystemByCode(systemCode);

            const systemOption = await this.packagesOptions.prepare(systemCode);

            //const removed = await eaRepository

            const c = await this.insertContainer(systemOption.system_id,
                systemOption.containers_package_id,
                container.name,
                container.code,
                "FDM API",
                container.version,
                container.description,
                container.status ?? "Proposed"
            );

            container.container_id = c.container_id;
            const apiList = container.interfaces ?? [];
            for (const it of apiList) {
                await this.interfaceRepository.addContainerInterface(systemCode, container, it);
            }
        });
    }
}


export const appRepository = new SystemsRepository();

export async function prepareSystemPackages(systemCode) {
    const app = await appRepository.byCode(systemCode);
    if (!app) throw NotFound(`Прилоение с кодом ${systemCode} не найдено`);

    if (!app.package_id || !app.containerPackageId || !app.api_pkg_id || !app.tc_pkg_id) {
        await eaRepository.transactionScope(async () => {

            const code = systemCode.toLowerCase();
            console.log(`Идет подготовка папок для приложения ${code}`);

            /** @type {{system_id, package_id, containers_package_id, interfaces_package_id, tc_package_id, root_id}} */
            const ret = await eaRepository.queryOne(SELECT_SYSTEM_PACKAGES, [code]);
            if (!ret) throw Error(`Не найдена информация о системе с кодом ${systemCode}`);
            if (!ret.root_id) throw Error('Не удалось найти каталог ТС');

            if (!ret.package_id) {
                const p = await eaRepository.createPackage({ name: ret.name ?? systemCode, parent_id: ret.root_id, alias: systemCode })
                ret.package_id = p.package_id;
            }

            if (!ret.containers_package_id) {
                const p = await eaRepository.createPackage({ name: CONTAINERS_SUBPACKAGE_NAME, parent_id: ret.package_id });
                ret.containers_package_id = p.package_id;
            }
            if (!ret.interfaces_package_id) {
                const p = await eaRepository.createPackage({ name: INTERFACES_SUBPACKAGE_NAME, parent_id: ret.package_id });
                ret.interfaces_package_id = p.package_id;
            }
            if (!ret.tc_package_id) {
                const p = await eaRepository.createPackage({ name: TC_SUBPACKAGE_NAME, parent_id: ret.package_id });
                ret.tc_package_id = p.package_id;
            }
            app.api_pkg_id = ret.interfaces_package_id;
            app.package_id = ret.package_id;
            app.containerPackageId = ret.containers_package_id;
            app.tc_pkg_id = ret.tc_package_id;
            ret.object_id = app.object_id;
            console.log(`Подготовка папок для приложения ${code} завершена`);
            return ret;
        });
    }
    return {
        package_id: app.package_id,
        containers_package_id: app.containerPackageId,
        interfaces_package_id: app.api_pkg_id,
        tc_package_id: app.tc_pkg_id,
        system_id: app.object_id
    };
}