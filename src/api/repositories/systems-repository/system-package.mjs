import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { CONTAINERS_SUBPACKAGE_NAME, INTERFACES_SUBPACKAGE_NAME } from "./const.mjs";
import { SELECT_SYSTEM_PACKAGES } from "./queries/index.mjs";
import { AsyncLocalStorage } from 'node:async_hooks';

export const systemContext = new AsyncLocalStorage();

/**
 * 
 * @param {async ()=>any} fn 
 */
export async function runSystemContext(systemCode, fn) {
    if (systemContext.getStore())
        return fn();

    const option = new SystemPackage();
    const context = await option.prepareSystemPackage(systemCode)

    return systemContext.run(context, fn);
}

/**
 * 
 * @param {*} systemCode 
 * @returns {Promise<{system_id, package_id, containers_package_id, interfaces_package_id, root_id}>}
 */
export async function getSystemContext(systemCode) {
    return systemContext.getStore() ?? (await (new SystemPackage()).prepareSystemPackage(systemCode));
}


export class SystemPackage {
    /**
     * 
     * @param {string} systemCode 
     * @returns {Promise<{system_id, package_id, containers_package_id, interfaces_package_id, root_id}>}
     */
    async prepareSystemPackage(systemCode) {
        const store = systemContext.getStore();
        if (store) return store;

        const code = systemCode.toLowerCase();

        /** @type {{system_id, package_id, containers_package_id, interfaces_package_id, root_id}} */
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
        return ret;
    }
}