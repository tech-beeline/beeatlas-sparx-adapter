import t_object from '../../../utils/ea-model/t_object.mjs';
import t_operationtag from '../../../utils/ea-model/t_operationtag.mjs';
import Repository from '../../../utils/ea-repo.mjs'
import { NotImplemented } from '../../../utils/errors.mjs';
import { PREPARE_INTERFACES_PACKAGE } from '../sql/system-container-sql.mjs';
import { SELECT_ALL_CONTAINERS_INTERFACES, SELECT_CONTAINER_INTERFACES } from './interfaces-queries.mjs';
import { INSERT_INTERFACE_METHOD, SELECT_INTERFACE_METHODS } from './methods-queries.mjs';

const INTERFACES_FOLDER = 'Interfaces'

class InterfaceDataService {
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
            .then(it => it ? { name: it.name, code: it.code, description: it.note, version: it.version } : null);
    }
    async selectContainerInterfaces(containerCode) {
        return Repository.queryRows(SELECT_CONTAINER_INTERFACES, [containerCode]);
    }
    /**
     * 
     * @param {string} interfaceCode 
     * @returns {Promise<Array<{ name, description, return_value, uid}>>}
     */
    async selectMethods(interfaceCode) {
        return Repository.queryRows(SELECT_INTERFACE_METHODS, [interfaceCode]);
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

    async insertInterface(containerCode, name, code, version, description, status, protocol, specification) {
        const [packageInfo, container] = await Promise.all([
            this.prepareInterfacesPackage(containerCode),
            Repository.first(t_object, { stereotype: 'C2', alias: containerCode })]
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

        await Repository.putConnector(container.object_id, it.object_id, 'Realisation');
        return { name: it.name, code: it.alias, description: it.note };
    }

    async updateInterface(name, code, version, description, status, protocol, specification) {
        return Repository.update(t_object,
            {
                name: name,
                status: status,
                version: version,
                note: description,
                status: status
            },
            { alias: code, object_type: 'Interface' });
    }

    async markInterfaceRemoved(name, code) {
        return Repository.update(t_object, { name: name, status: 'REMOVED' }, { alias: code, object_type: 'Interface' });
    }

    async insertMethod(interfaceCode, name, description, returnType, rps, latency, error_rate) {
        const method = await Repository.queryOne(INSERT_INTERFACE_METHOD, [interfaceCode, name, description, returnType]);
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
}

export default new InterfaceDataService();