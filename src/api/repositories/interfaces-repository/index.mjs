import { TechnicalCapabilitiesRepository } from '../index.mjs';
import Repository, { REALIZATION_CONNECTOR, t_connector, t_object, t_operation, t_operationparams, t_operationtag } from '../sparx-ea-repository/index.mjs';

import { PREPARE_INTERFACES_PACKAGE } from '../sql/system-container-sql.mjs';
import { DEFAULT_STATUS, METHOD_REMOVED_TAG, REMOVED_STATUS } from '../systems-repository/const.mjs';
import { API_LOAD_DATE_TAG, API_SPECFICATION_TAG } from './const.mjs';
import { SELECT_ALL_CONTAINERS_INTERFACES, SELECT_API_TC, SELECT_CONTAINER_INTERFACES, SELECT_CONTAINER_INTERFACES_BY_ID, SELECT_INTERFACES_BY_CONTAINER_LIST } from './interfaces-queries.mjs';
import { INSERT_INTERFACE_METHOD, SELECT_ALL_METHODS, SELECT_INTERFACE_METHODS, SELECT_METHOD_BY_NAME_INTERFACE_CODE, UPDATE_OPERATION, SELECT_METHOD_SLA, SELECT_INTERFACE_METHODS_BY_ID, SELECT_METHOD_BY_NAME_INTERFACE_ID, CHECK_METHOD_USAGE } from './methods-queries.mjs';
import { APIInterface, APIMethod, isAPIEquals, isMethodEquals } from '../../model/system.mjs';
import { SystemPackage } from '../systems-repository/system-package.mjs';
import { randomUUID } from 'node:crypto';

const INTERFACES_FOLDER = 'Interfaces'


const tcRepository = new TechnicalCapabilitiesRepository();

export class InterfacesRepository {
    /** @type {SystemPackage} */
    packagesOptions;
    constructor(packagesOptions) {
        this.packagesOptions = packagesOptions ?? (new SystemPackage())
    }
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
            .then(it => it ? { name: it.name, code: it.code, description: it.note, version: it.version, object_id: it.object_id } : null);
    }

    async selectInterfaceByUID(interfaceUID) {
        return Repository.first(t_object, { object_type: 'Interface', ea_guid: interfaceUID })
            .then(it => it ? { name: it.name, code: it.code, description: it.note, version: it.version, object_id: it.object_id } : null);
    }

    async selectContainerInterfaces(containerCode) {
        return Repository.queryRows(SELECT_CONTAINER_INTERFACES, [containerCode]);
    }

    async selectInterfacesBySystemCode(systemCode) {
        return Repository.queryRows(SELECT_INTERFACES_BY_CONTAINER_LIST, [systemCode]);
    }


    /**
     * 
     * @param {*} container_id 
     * @returns {Promise<Array<{code, interface_id, name, description,version, status, specification, tcCode}>>}
     */
    async selectContainerInterfacesById(container_id) {
        return Repository.query(SELECT_CONTAINER_INTERFACES_BY_ID, container_id);
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

        await Repository.updateObjectTags(it.object_id, { [API_SPECFICATION_TAG]: specification, [API_LOAD_DATE_TAG]: (new Date()).toLocaleString() }, [API_SPECFICATION_TAG, API_LOAD_DATE_TAG]);

        if (tcCode) {
            const targetTcList = await tcRepository.selectTCByCode(tcCode);
            if (!targetTcList.length) throw Error(`TC with code=${tcCode} not found`);

            for (const tc of targetTcList) {
                await Repository.putConnector(it.object_id, tc.object_id, REALIZATION_CONNECTOR);
            }
        }

        await Repository.putConnector(container.object_id, it.object_id, REALIZATION_CONNECTOR);

        return { name: it.name, code: it.alias, description: it.note, object_id: it.object_id };
    }

    /**
     * 
     * @param {*} interface_id 
     * @param {APIInterface} api 
     */
    async #updateInterface(interface_id, api) {
        if (!interface_id) throw Error("interface_id==null");

        console.log(`Обновляем информацию об интерфейсе ${api.name}, code=[${api.code}]`)

        return Repository.transactionScope(async () => {
            await Repository.update(t_object,
                {
                    name: api.name,
                    status: api.status,
                    version: api.version,
                    note: api.description,
                    status: api.status,
                    alias: api.code.toLowerCase()
                },
                { object_id: interface_id });

            await Repository.updateObjectTags(interface_id, { [API_SPECFICATION_TAG]: api.specification, [API_LOAD_DATE_TAG]: Date(), protocol: api.protocol });

            /** @type {{ code:string, name:string, object_id }[]} */
            const currentImplementation = await Repository.query(SELECT_API_TC, interface_id);
            for (const tc of currentImplementation.filter(tc => tc.code.toLowerCase() != api.implements?.toLowerCase())) {
                await Repository.delete(t_connector, { start_object_id: interface_id, end_object_id: tc.object_id, connector_type: REALIZATION_CONNECTOR });
            }

            if (api.implements) {
                const targetTcList = await tcRepository.selectTCByCode(api.implements);
                if (!targetTcList.length) throw Error(`TC with code=${api.implements} not found`);

                for (const tc of targetTcList) {
                    await Repository.putConnector(interface_id, tc.object_id, REALIZATION_CONNECTOR);
                }
            }
        });
    }

    async updateInterface(name, code, version, description, status, specification, tcCode, protocol) {
        const apiList = await Repository.find(t_object, { alias: code, object_type: 'Interface' });
        if (!apiList.length) throw Error(`Интерфейсы с кодом "${code}" не найдены`);

        return Repository.transactionScope(async () => {
            for (const it of apiList) {
                await this.#updateInterface(it.object_id, {
                    name: name,
                    code: code,
                    version: version,
                    description: description,
                    status: status,
                    specification: specification,
                    implements: tcCode,
                    protocol: protocol
                })
            }
        });
    }

    async markInterfaceRemoved(name, code) {
        return Repository.update(t_object, { name: name, status: 'REMOVED' }, { alias: code, object_type: 'Interface' });
    }


    /**
     * 
     * @param {{object_id}} api 
     * @param { { name, description, returnType, rps, latency, error_rate, implements }} method 
     */
    async insertMethod({ object_id }, { name, description, returnType, rps, latency, error_rate, implements: tcCode }) {
        if (!object_id) throw Error('object_id==null');

        const existingMethod = await Repository.queryOne(SELECT_METHOD_BY_NAME_INTERFACE_ID, [object_id, name]);
        if (existingMethod) {
            await Repository.updateOperationTags(existingMethod.operationid, { [METHOD_REMOVED_TAG]: null });
        }

        const method = existingMethod ?? await Repository.insert(t_operation, {
            object_id: object_id, name: name, notes: description, type: returnType,
            ea_guid: randomUUID().toUpperCase()
        }) //Repository.queryOne(INSERT_INTERFACE_METHOD, [code, name, description, returnType]);

        if (tcCode) {
            const tc = await tcRepository.selectTCByCode(tcCode);
            if (!tc.length) throw Error(`TC с кодом =[${tcCode}] для метода ${name} не найден`);
        }

        const tags = {
            rps: rps,
            latency: latency,
            error_rate: error_rate,
            implements: tcCode
        }
        for (const tag in tags) {
            if (!tags[tag]) continue;
            await Repository.insert(t_operationtag,
                {
                    elementid: method.operationid,
                    property: tag,
                    value: tags[tag]
                });
        }
    }

    async updateMethod(operationid, { name, description, returnType, rps, latency, error_rate, implements: tcCode }) {
        if (!operationid) throw Error('operationid is not specified');

        if (tcCode) {
            const tc = await tcRepository.selectTCByCode(tcCode);
            if (!tc.length) throw Error(`TC с кодом =[${tcCode}] для метода ${name} не найден`);
        }
        console.info('Обновляем метод', name);
        //const updatedMethods = await Repository.queryRows(UPDATE_OPERATION, [interfaceCode, name, description, returnType]);
        const method = await Repository.update(t_operation, { name: name, notes: description, type: returnType }, { operationid: operationid })
        if (!method.length) throw Error(`Метод с operationid=${operationid} не найден`)
        const tv = {
            rps: rps,
            latency: latency,
            error_rate: error_rate,
            removedDate: null,
            implements: tcCode
        };
        console.info('Обновляем tagged value', tv);
        await Repository.updateOperationTags(method[0].operationid, tv);
    }

    async markMethodRemoved(interfaceCode, name) {
        const operations = await Repository.queryRows(SELECT_METHOD_BY_NAME_INTERFACE_CODE, [interfaceCode, name])
        for (const op of operations) {
            await Repository.updateOperationTags(op.operationid, { removedDate: new Date() });
        }
        console.info(`${interfaceCode}:${name} - помечен удаленным`);
    }

    async setContainerInterfaces({ code, object_id }, interfaces) {
        if (!object_id) throw Error('Container object id is not specified');

        interfaces = interfaces ?? [];
        try {
            console.info(`${code} - Обновление инфтерфейсов контейнера`)
            const currentAPIList = await this.selectContainerInterfacesById(object_id);
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
                console.info(`${code} - Добавление интерфейса [${it.code}] ${it.name}`);
                const new_api = await this.insertInterface(code, it.name, it.code, it.version, it.description, it.status, it.specification, it.implements);
                const methods = it.methods ?? [];
                it.object_id = new_api.object_id;

                await this.setInterfaceMethods(it, methods);
                console.info(`${code} - Интерфейс добавлен [${it.code}] ${it.name}`);
            }

            for (const it of toUpdate) {
                console.info(`${code} - Обновление интерфейса и методов [${it.code}] ${it.name}`);
                if (!isAPIEquals(it, it.currentAPI)) {
                    console.info(`${code} - Обновление интерфейса [${it.code}] ${it.name}`);
                    await this.updateInterface(it.name, it.code, it.version, it.description, it.status, it.specification, it.implements);
                }

                const methods = it.methods ?? [];
                it.object_id = it.currentAPI.object_id;
                await this.setInterfaceMethods(it, methods);
                delete it.currentAPI;

                console.info(`${code} - Интерфейс и методы обновлены [${it.code}] ${it.name}, status = ${it.status}`);
            }
        } catch (error) {
            console.error(error.message, code, interfaces);
            throw error;
        }
    }

    async setInterfaceMethods({ code, object_id }, methods = []) {
        if (!object_id) {
            const it = await this.selectInterfaceByCode(code);
            object_id = it.object_id;
            if (!object_id) throw Error("INterface object_id is not specified");
        }

        const currentMethods = await Repository.query(SELECT_INTERFACE_METHODS_BY_ID, object_id);

        const methodsToRemove = currentMethods.filter(cm => !cm.removed_date && !methods.find(m => m.name.toLowerCase() === cm.name.toLowerCase()));

        if (!methodsToRemove.length && !methods.length) {
            console.log(`${code} - Обновление методов не требуется`);
            return;
        }

        if (methodsToRemove.length) {
            console.info(`Удаление методов`, methodsToRemove);
            for (const m of methodsToRemove) {
                await this.markMethodRemoved(code, m.name);
            }
        }

        if (methods.length) {
            console.log(`${code} - Добавление и обновление методов`, methods);
            for (const m of methods) {
                const currentMethod = currentMethods.find(cm => cm.name.toLowerCase() === m.name.toLowerCase());
                if (currentMethod) {
                    if (!isMethodEquals(currentMethod, m)) {
                        console.info(`${code} - Обновление метода ${m.name}`);
                        await this.updateMethod(currentMethod.operationid, m);
                    }
                    if (currentMethod.removed_date) {
                        await Repository.updateOperationTags(currentMethod.operationid, { removedDate: null })
                    }
                    continue;
                }
                console.log(`${code} - добавление метода ${m.name}`);
                await this.insertMethod({ object_id: object_id }, m);
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
        const method = await Repository.queryOne(SELECT_METHOD_BY_NAME_INTERFACE_ID, [api.object_id, methodName]);
        if (!method)
            throw Error(`Method ${methodName} not found`);
        await Repository.updateOperationTags(method.operationid, { rps: rps, latency: latency, error_rate: error_rate });
        const sla = await Repository.queryOne(SELECT_METHOD_SLA, [method.operationid]);
        return { ...sla, methodName: methodName, interfaceCode: interfaceCode, interfaceUID: interfaceUID };
    }

    /**
     * 
     * @param {{ operationid}} method
     */
    async deleteMethod({ operationid, name }) {
        if (!operationid) throw Error('operationid==null');
        const methodUsage = await Repository.queryOne(CHECK_METHOD_USAGE, [operationid]);
        if (!methodUsage) {
            console.log(`Method ${name}, operationid=${operationid} нигде не используется, поэтому можем удалять`);
            await Repository.deleteOperation(operationid);
            return;
        }
        console.log(`Помечаем метод ${name} удаленным (${METHOD_REMOVED_TAG})`);
        await Repository.updateOperationTags(operationid, { [METHOD_REMOVED_TAG]: new Date() });
        return;
    }

    async deleteContainerInterface(container_id, interface_id) {
        return Repository.transactionScope(async () => {
            const methods = await Repository.find(t_operation, { object_id: interface_id });
            for (const method of methods) {
                await this.deleteMethod(method);
            }

            await Repository.removeConnectors(container_id, interface_id, REALIZATION_CONNECTOR);

            if (await Repository.canDeleteObject(interface_id)) {
                console.log(`Интерфейс [object_id=${interface_id}] ни с чем не связан и будет удален`);
                await Repository.deleteObject(interface_id);
            } else {
                await Repository.update(t_object, { status: REMOVED_STATUS }, { object_id: interface_id })
                await Repository.updateObjectTags(interface_id, { [API_LOAD_DATE_TAG]: new Date() });
            }
        });
    }

    async deleteContainerInterfaces(container_id) {
        if (!container_id) throw Error("container_id==null");

        const apiList = await this.selectContainerInterfacesById(container_id);
        return Repository.transactionScope(async () => {
            for (const it of apiList) {
                await this.deleteContainerInterface(container_id, it.interface_id);
            };
        });
    }

    /**
     * 
     * @param {*} container_id 
     * @param {*} package_id 
     * @param {APIInterface} it 
     * @returns 
     */
    async #insertInterface(container_id, package_id, it) {
        if (!container_id) throw Error('container_id==null')
        if (!package_id) throw Error('package_id==null')
        if (!it) throw Error('container==null')

        const created = await Repository.createObject({
            package_id: package_id,
            name: it.name,
            alias: it.code,
            version: it.version,
            object_type: 'Interface',
            author: "FDM API",
            note: it.description,
            status: it.status,
            backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
        });
        it.interface_id = created.object_id;

        await Repository.updateObjectTags(
            created.object_id,
            {
                [API_SPECFICATION_TAG]: it.specification,
                [API_LOAD_DATE_TAG]: (new Date()).toLocaleString(),
                "protocol": it.protocol
            });

        if (it.implements) {
            const targetTcList = await tcRepository.selectTCByCode(it.implements);
            if (!targetTcList.length) throw Error(`TC with code=${it.implements} not found`);

            for (const tc of targetTcList) {
                await Repository.putConnector(created.object_id, tc.object_id, REALIZATION_CONNECTOR);
            }
        }

        await Repository.putConnector(container_id, created.object_id, REALIZATION_CONNECTOR);

        return { name: it.name, code: it.alias, description: it.note, object_id: it.interface_id, interface_id: it.interface_id };
    }

    /**
     * 
     * @param {{code, container_id}} container 
     * @param {APIInterface} api 
     */
    async addContainerInterface(systemCode, { code: containerCode, container_id }, api) {
        if (!container_id) throw Error('container_id==null');


        const systemOptions = await this.packagesOptions.prepareSystemPackage(systemCode);
        const new_api = await this.#insertInterface(container_id, systemOptions.interfaces_package_id, api);
        if (!api.interface_id) throw Error("api.interface_id==null");
        const methods = api.methods ?? [];
        for (const method of methods) {
            await this.insertMethod({ object_id: new_api.interface_id }, method);
        }
    }
    /**
     * 
     * @param {*} interface_id 
     * @param {APIMethod[]} methods 
     */
    async updateInterfaceMethods(interface_id, methods) {
        if (!interface_id) throw Error("interface_id==null");

        methods = methods ?? [];
        /** @type {t_operation[]} */
        const existingMethods = await Repository.query(SELECT_INTERFACE_METHODS_BY_ID, interface_id);

        return Repository.transactionScope(async () => {

            for (const e of existingMethods) {
                if (!methods.find(m => m.name.toLowerCase() === e.name.toLowerCase())) {
                    await this.deleteMethod(e);
                }
            }

            for (const m of methods) {
                const existing = existingMethods.filter(e => e.name.toLowerCase() === m.name.toLowerCase() && !e.removed_date);
                if (!existing.length) {
                    await this.insertMethod({ object_id: interface_id }, m);
                    continue;
                }

                if (existing.length === 1) {
                    const em = existing[0];
                    if (!isMethodEquals(m, em)) {
                        await this.updateMethod(em.operationid, m);
                    }
                    continue;
                }
                const targetMethod = existing.find(e => e.used) ?? existing[0];
                if (!targetMethod) throw Error(`targetMethod==null`)
                for (const em of existing) {
                    if (em.operationid === targetMethod.operationid) {
                        if (!isMethodEquals(m, em)) {
                            await this.updateMethod(em.operationid, m);
                        }
                        continue;
                    }
                    await this.deleteMethod(em);
                }
            }
        });
    }
    /**
     * 
     * @param {*} systemCode 
     * @param {*} container_id 
     * @param {APIInterface[]} interfaces 
     */
    async updateContainerInterfaces(systemCode, container_id, interfaces) {
        if (!container_id) throw Error('container_id==null');
        interfaces = interfaces ?? [];
        const existingApiList = await this.selectContainerInterfacesById(container_id);

        return Repository.transactionScope(async () => {
            const outdateInterfaces = existingApiList.filter(e => !interfaces.find(c => c.code.toLowerCase() === e.code.toLowerCase()));
            for (const outdateApi of outdateInterfaces) {
                await this.deleteContainerInterface(container_id, outdateApi.interface_id);
            }

            const newApiList = interfaces.filter(n => !existingApiList.find(e => e.code.toLowerCase() === n.code.toLowerCase()));
            for (const newApi of newApiList) {
                await this.addContainerInterface(systemCode, { container_id: container_id }, newApi);
            }
            for (const api of interfaces) {
                console.log(api.name);
                const existingApi = existingApiList.find(e => e.code.toLowerCase() === api.code.toLowerCase());
                if (!existingApi) {
                    console.log(`Не найден существующий интерфес для code=${api.code}`);
                    continue;
                }

                if (!isAPIEquals(api, existingApi)) {
                    await this.#updateInterface(existingApi.interface_id, api);
                }
                await this.updateInterfaceMethods(existingApi.interface_id, api.methods);
            }
        })
    }
    async selectSystemProvidedAPI(appCode) {

    }
};
