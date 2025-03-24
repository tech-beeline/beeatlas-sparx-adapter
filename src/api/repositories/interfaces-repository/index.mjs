import { getImpliedNodeFormatForFile } from 'typescript';
import { NotImplemented } from '../../../utils/errors.mjs';
import { TechnicalCapabilitiesRepository } from '../index.mjs';
import Repository, { REALIZATION_CONNECTOR, t_connector, t_object, t_operation, t_operationtag } from '../sparx-ea-repository/index.mjs';

import { PREPARE_INTERFACES_PACKAGE } from '../sql/system-container-sql.mjs';
import { DEFAULT_STATUS, REMOVED_STATUS } from '../systems-repository/const.mjs';
import { API_SPECFICATION_TAG } from './const.mjs';
import { SELECT_ALL_CONTAINERS_INTERFACES, SELECT_API_TC, SELECT_CONTAINER_INTERFACES } from './interfaces-queries.mjs';
import { INSERT_INTERFACE_METHOD, SELECT_ALL_METHODS, SELECT_INTERFACE_METHODS, SELECT_INTERFACE_METHOD, SELECT_METHOD_BY_NAME_INTERFACE_CODE, UPDATE_OPERATION, SELECT_METHOD_SLA } from './methods-queries.mjs';

const INTERFACES_FOLDER = 'Interfaces'

const isAPIEquals = (a, b) => a.name === b.name
    && a.description === b.description
    && a.version === b.version
    && a.status === b.status
    && a.specification == b.specification
    && a.implements == b.implements;

const isMethodEquals = (a, b) =>
    a.name === b.name && (a.description ?? "") === (b.description ?? "")
    && (a.rps?.toString() ?? "") === (b.rps?.toString() ?? "")
    && (a.latency?.toString() ?? "") === (b.latency?.toString() ?? "")
    && (a.error_rate?.toString() ?? "") === (b.error_rate?.toString() ?? "");


const tcRepository = new TechnicalCapabilitiesRepository();

export class InterfacesRepository {
    /**
     * 
     * @returns {Promise<Array<{ container_code, code,name, derscription,version, status}>>}
     */
    async selectAllContainersInterfaces() {
        return Repository.queryRows(SELECT_ALL_CONTAINERS_INTERFACES);
    }

    /**
     * 
     * @param {string} interfaceCode 
     */
    async selectInterfaceByCode(interfaceCode) {
        return Repository.first(t_object, { object_type: 'Interface', alias: interfaceCode })
            .then(it => it ? { name: it.name, code: it.code, description: it.note, version: it.version, object_id: it.object_id} : null);
    }

    async selectInterfaceByUID(interfaceUID) {
        return Repository.first(t_object, { object_type: 'Interface', ea_guid: interfaceUID })
            .then(it => it ? { name: it.name, code: it.code, description: it.note, version: it.version, object_id: it.object_id } : null);
    }

    async selectContainerInterfaces(containerCode) {
        return Repository.queryRows(SELECT_CONTAINER_INTERFACES, [containerCode]);
    }

    /**
     * 
     * @param {string} interfaceCode 
     * @returns {Promise<Array<{ interface_code, interface_name,name, description, return_value, uid}>>}
     */
    async selectAllMethods() {
        return Repository.queryRows(SELECT_ALL_METHODS);
    }
    /**
     * 
     * @param {string} interfaceCode 
     * @returns {Promise<Array<{ name, description, return_value, uid}>>}
     */
    async selectInterfaceMethods(interfaceCode) {
        return Repository.queryRows(SELECT_INTERFACE_METHODS, [interfaceCode]).then(rows => rows.filter(r => !r.removed_date));
    }

    /**
    * 
    * @param {string} systemCode 
    * @returns {Promise<{package_id}>}
    */
    async prepareInterfacesPackage(containerCode) {
        // [ ] Надо ли кешировать идентификаторы папок?
        // [ ] Уточнить структуру папок
        return Repository.queryOne(PREPARE_INTERFACES_PACKAGE, [INTERFACES_FOLDER, containerCode]);
    }

    async insertInterface(containerCode, name, code, version, description, status, specification, tcCode, protocol) {
        const [packageInfo, container] = await Promise.all([
            this.prepareInterfacesPackage(containerCode),
            Repository.first(t_object, { stereotype: 'C4_Container', alias: containerCode })]
        );

        if (!container) throw Error(`Container with code = ${containerCode} not found`)

        const it = await Repository.createObject({
            package_id: packageInfo.package_id,
            name: name,
            alias: code,
            version: version,
            object_type: 'Interface',
            author: "FDM API",
            note: description,
            status: status,
            backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
        });

        if (specification) {
            await Repository.updateObjectTags(it.object_id, { [API_SPECFICATION_TAG]: specification }, [API_SPECFICATION_TAG]);
        }
        if (tcCode) {
            const targetTcList = await tcRepository.selectTCByCode(tcCode);
            if (!targetTcList.length) throw Error(`TC with code=${tcCode} not found`);

            for (const tc of targetTcList) {
                await Repository.putConnector(it.object_id, tc.object_id, REALIZATION_CONNECTOR);
            }
        }

        await Repository.putConnector(container.object_id, it.object_id, REALIZATION_CONNECTOR);

        return { name: it.name, code: it.alias, description: it.note };
    }

    async updateInterface(name, code, version, description, status, specification, tcCode, protocol) {
        const updated = await Repository.update(t_object,
            {
                name: name,
                status: status,
                version: version,
                note: description,
                status: status
            },
            { alias: code, object_type: 'Interface' });
        for (const it of updated) {
            await Repository.updateObjectTags(it.object_id, { [API_SPECFICATION_TAG]: specification }, [API_SPECFICATION_TAG]);
            /** @type {{ code:string, name:string, object_id }[]} */
            const currentImplementation = await Repository.query(SELECT_API_TC, it.object_id);
            for (const tc of currentImplementation.filter(tc => tc.code.toLowerCase() != tcCode?.toLowerCase())) {
                await Repository.delete(t_connector, { start_object_id: it.object_id, end_object_id: tc.object_id, connector_type: REALIZATION_CONNECTOR });
            }
            if (tcCode) {
                const targetTcList = await tcRepository.selectTCByCode(tcCode);
                if (!targetTcList.length) throw Error(`TC with code=${tcCode} not found`);

                for (const tc of targetTcList) {
                    await Repository.putConnector(it.object_id, tc.object_id, REALIZATION_CONNECTOR);
                }
            }
        }
    }

    async markInterfaceRemoved(name, code) {
        return Repository.update(t_object, { name: name, status: 'REMOVED' }, { alias: code, object_type: 'Interface' });
    }

    async insertMethod(interfaceCode, name, description, returnType, rps, latency, error_rate) {
        const existingMethod = await Repository.queryOne(SELECT_METHOD_BY_NAME_INTERFACE_CODE, [interfaceCode, name]);
        if (existingMethod) {
            await Repository.updateOperationTags(existingMethod.operationid, { removedDate: null });
        }

        const method = existingMethod ?? await Repository.queryOne(INSERT_INTERFACE_METHOD, [interfaceCode, name, description, returnType]);
        const tagMap = {
            rps: rps, latency: latency, error_rate: error_rate
        }
        for (const tag in tagMap) {
            if (!tagMap[tag]) continue;
            Repository.insert(t_operationtag,
                {
                    elementid: method.operationid,
                    property: tag,
                    value: tagMap[tag]
                });
        }
    }

    async updateMethod(interfaceCode, name, description, returnType, rps, latency, error_rate) {
        console.info('Обновляем метод', name);
        const updatedMethods = await Repository.queryRows(UPDATE_OPERATION, [interfaceCode, name, description, returnType]);
        console.info('Обновляем tagged value', { name: name, rps: rps, latency: latency, error_rate: error_rate });
        for (const method of updatedMethods) {
            await Repository.updateOperationTags(method.operationid, { rps: rps, latency: latency, error_rate: error_rate, removedDate: null })
        }
    }

    async markMethodRemoved(interfaceCode, name) {
        const operations = await Repository.queryRows(SELECT_METHOD_BY_NAME_INTERFACE_CODE, [interfaceCode, name])
        for (const op of operations) {
            await Repository.updateOperationTags(op.operationid, { removedDate: new Date() });
        }
        console.info(`${interfaceCode}:${name} - помечен удаленным`);
    }

    async setContainerInterfaces(containerCode, interfaces = []) {
        interfaces = interfaces ?? [];
        try {
            console.info(`${containerCode} - Обновление инфтерфейсов контейнера`)
            const currentAPIList = await this.selectContainerInterfaces(containerCode);
            const newAPIs = [], toUpdate = [];
            for (const it of interfaces ?? []) {
                if (!it.status) it.status = DEFAULT_STATUS;

                const currentAPI = currentAPIList.find(i => i.code === it.code);
                if (!currentAPI) {
                    newAPIs.push(it);
                    continue;
                }
                it.currentAPI = currentAPI;
                toUpdate.push(it);
            }

            for (const it of currentAPIList) {
                if (it.status !== REMOVED_STATUS && !interfaces?.find(i => i.code === it.code)) {
                    it.currentAPI = { ...it };
                    it.status = REMOVED_STATUS;
                    toUpdate.push(it);
                }
            }

            console.group("Планируемые изменения")
            console.info("Добавить интерфейсы: ", newAPIs.map(it => it.code).join(','));
            console.info("Обновить интерфейсы: ", toUpdate);
            console.groupEnd();

            for (const it of newAPIs) {
                console.info(`${containerCode} - Добавление интерфейса [${it.code}] ${it.name}`);
                await this.insertInterface(containerCode, it.name, it.code, it.version, it.description, it.status, it.specification, it.implements);
                const methods = it.methods ?? [];
                await this.setInterfaceMethods(it.code, methods);
                console.info(`${containerCode} - Интерфейс добавлен [${it.code}] ${it.name}`);
            }

            for (const it of toUpdate) {
                console.info(`${containerCode} - Обновление интерфейса и методов [${it.code}] ${it.name}`);
                if (!isAPIEquals(it, it.currentAPI)) {
                    console.info(`${containerCode} - Обновление интерфейса [${it.code}] ${it.name}`);
                    await this.updateInterface(it.name, it.code, it.version, it.description, it.status, it.specification, it.implements);
                }

                const methods = it.methods ?? [];
                await this.setInterfaceMethods(it.code, methods);
                delete it.currentAPI;

                console.info(`${containerCode} - Интерфейс и методы обновлены [${it.code}] ${it.name}, status = ${it.status}`);
            }
        } catch (error) {
            console.error(error.message, containerCode, interfaces);
            throw error;
        }
    }

    async setInterfaceMethods(interfaceCode, methods = []) {
        const currentMethods = await Repository.queryRows(SELECT_INTERFACE_METHODS, [interfaceCode]);
        const methodsToRemove = currentMethods.filter(cm => !cm.removed_date && !methods.find(m => m.name === cm.name));

        if (!methodsToRemove.length && !methods.length) {
            console.log(`${interfaceCode} - Обновление методов не требуется`);
            return;
        }

        if (methodsToRemove.length) {
            console.info(`Удаление методов`, methodsToRemove);
            for (const m of methodsToRemove) {
                await this.markMethodRemoved(interfaceCode, m.name);
            }
        }

        if (methods.length) {
            console.log(`${interfaceCode} - Добавление и обновление методов`, methods);
            for (const m of methods) {
                const currentMethod = currentMethods.find(cm => cm.name === m.name);
                if (currentMethod) {
                    if (!isMethodEquals(currentMethod, m)) {
                        console.info(`${interfaceCode} - Обновление метода ${m.name}`);
                        await this.updateMethod(interfaceCode, m.name, m.description, m.returnType, m.rps, m.latency, m.error_rate);
                    }
                    if (currentMethod.removed_date) {
                        await Repository.updateOperationTags(currentMethod.operationid, { removedDate: null })
                    }
                    continue;
                }
                console.log(`${interfaceCode} - добавление метода ${m.name}`);
                await this.insertMethod(interfaceCode, m.name, m.description, m.returnType, m.rpos, m.latency, m.error_rate);
            }
        }
    }
    /**
     * 
     * @param {{ interfaceCode, interfaceUID, methodName, rps, latency, error_rate }} sla
     * @returns {Promise<{ interfaceCode, interfaceUID, methodName, rps, latency, error_rate }>}}
     */
    async updateMethodSLA({ interfaceCode, interfaceUID, methodName, rps, latency, error_rate } = {}) {
        if (!interfaceCode && !interfaceUID)
            throw Error("interface code and interface uid not specified");

        const api = interfaceUID ? (await this.selectInterfaceByUID(interfaceUID)) :
            (await this.selectInterfaceByCode(getImpliedNodeFormatForFile));
        if (!api)
            throw Error("Interface not found");
        const method = await Repository.queryOne(SELECT_INTERFACE_METHOD, [api.object_id, methodName]);
        if (!method)
            throw Error(`Method ${methodName} not found`);
        await Repository.updateOperationTags(method.operationid, { rps: rps, latency: latency, error_rate: error_rate });
        const sla = await Repository.queryOne(SELECT_METHOD_SLA, [method.operationid]);
        return { ...sla, methodName: methodName, interfaceCode: interfaceCode, interfaceUID: interfaceUID };
    }
}
