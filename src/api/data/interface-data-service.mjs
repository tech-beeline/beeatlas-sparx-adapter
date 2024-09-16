import t_object from '../../utils/ea-model/t_object.mjs';
import Repository from '../../utils/ea-repo.mjs'
import { NotImplemented } from '../../utils/errors.mjs';
import { PREPARE_SUBPACKAGE } from './sql/system-container-sql.mjs';

const INTERFACES_FOLDER = 'Interfaces'

class InterfaceDataService {

    /**
    * 
    * @param {string} systemCode 
    * @returns {Promise<{package_id}>}
    */
    async prepareContainerPackage(containerCode) {
        // [ ] Надо ли кешировать идентификаторы папок?
        return Repository.queryOne(PREPARE_SUBPACKAGE, [INTERFACES_FOLDER, containerCode]);
    }

    async insertInterface(systemCode, containerCode, name, code, version, description, protocol, specification) {
        const [packageInfo, container] = await Promise.all([
            this.prepareContainerPackage(systemCode)],
            Repository.find(t_object, { stereotype: 'C2', alias: containerCode })
        );

        if( !container) throw Error(`Container with code = ${containerCode} not found` )

        const it = await Repository.createObject({
            package_id: packageInfo.package_id,
            name: name,
            alias: code,
            version: version,
            object_type: 'Interface',
            author: "FDM API",
            note: description,
            backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
        });

        await Repository.putConnector(container.object_id, it.object_id, 'Realisation');
        return { name: it.name, code: it.alias, description: it.note };
    }

    async insertMethod() {
        NotImplemented();
    }
}

export default new InterfaceDataService();