import { NotImplemented } from "../../../utils/errors.mjs";
import { Container, isContainersEquals } from "../../model/system.mjs";
import { API_LOAD_DATE_TAG } from "../interfaces-repository/const.mjs";
import { KeyValueCache } from "../key-value-cache/index.mjs";
import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { REALIZATION_CONNECTOR, t_object } from "../sparx-ea-repository/index.mjs";
import { CONTAINER_STEREOTYPE, REMOVED_STATUS } from "./const.mjs";
import { SystemDTOInternal } from "./model.mjs";
import { appPackages } from "./system-package.mjs";
import { SELECT_SYSTEM_CONTAINERS } from "./systems-containers-queries.mjs";


class ContainerRepository {


    /**
     * 
     * @param {SystemDTOInternal} appCode 
     * @param {ContainerEntity} container 
     */
    async put(appCode, container) {
        const current = await this.byCode(container.code)
        if (!current) {
            console.log(`\t[${appCode}]: контейнер [${container.code}] не найден, создаем`);
            const { containers_package_id, system_id } = await appPackages.prepare(appCode);
            if (!containers_package_id)
                throw Error('containers_package_id is null');

            const obj = await eaRepository.createObject({
                package_id: containers_package_id,
                name: container.name,
                object_type: "Component",
                author: container.author,
                alias: container.code.toLowerCase(),
                version: container.version,
                note: container.description,
                status: container.status,
                stereotype: CONTAINER_STEREOTYPE,
                backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
            });

            await eaRepository.putConnector(system_id, obj.object_id, 'Realisation');

            console.log(`\t[${appCode}]: контейнер [${container.code}] создан`);
            container.sys_code = appCode;
            container.container_id = obj.object_id;

            return container;
        }

        if (isContainersEquals(current, container))
            return current;


        const [obj] = await eaRepository.update(t_object, {
            name: container.name,
            author: container.author,
            alias: container.code.toLowerCase(),
            version: container.version,
            note: container.description,
            status: container.status,
            modifieddate: new Date()
        }, { object_id: current.container_id });

        current.name = obj.name;
        current.code = obj.alias;
        current.description = obj.note;
        current.version = obj.version;
        current.status = obj.status;
        return current;
    }

    async delete(system_id, container) {

        const container_id = container.container_id;
        await eaRepository.removeConnectors(system_id, container_id, REALIZATION_CONNECTOR);

        const can_delete = await eaRepository.canDeleteObject(container_id);
        if (can_delete) {
            return eaRepository.deleteObject(container_id);
        }

        await eaRepository.putConnector(system_id, container_id, REALIZATION_CONNECTOR);
        let c_name = container.name || container.container_name;
        if (!c_name.startsWith('[LEGACY]')) {
            c_name = `[LEGACY] ${c_name}`;
        }
        await eaRepository.update(t_object, { status: REMOVED_STATUS, name: c_name }, { object_id: container_id });
        return eaRepository.updateObjectTags(container_id, { [API_LOAD_DATE_TAG]: new Date() });
    }
}

export const containerRepository = new ContainerRepository();