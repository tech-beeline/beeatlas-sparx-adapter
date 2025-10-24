import { NotImplemented } from "../../../../utils/errors.mjs";
import { isAPIEquals, isContainersEquals, isMethodEquals } from "../../../model/system.mjs";
import { appRepository, interfaceRepository, methodRepository } from "../../../repositories/index.mjs";
import { REMOVED_STATUS } from "../../../repositories/systems-repository/const.mjs";
import { SystemDTOInternal } from "../../../repositories/systems-repository/model.mjs";
import { removeInterface } from "./remove-container.mjs";


async function putMethod(api, method) {
    const existing_method = api.methods?.find(m => m.name.toLowerCase() === method.name.toLowerCase());
    if (existing_method) {
        if (!isMethodEquals(existing_method, method)) {
            return methodRepository.update(existing_method, method);
        }
        console.log(`Метод ${method.name} не требует изменений`)
        return;
    }
    return methodRepository.insert(api.interface_id, method);
}

async function putInterfaceMethods(api, data) {
    const data_methods = data.methods ?? [];
    for (const m of api.methods ?? []) {
        const em = data_methods.find(i => i.name.toLowerCase() === m.name.toLowerCase());
        if (em || m.removed) {
            continue;
        }
        await methodRepository.delete(m);
    }
    for (const m of data_methods) {
        await putMethod(api, m);
    }
}

export async function putInterface(app, container, api) {
    const existing_api = container.interfaces?.[api.code.toLowerCase()];
    if (existing_api && (existing_api.doubles || !isAPIEquals(existing_api, api))) {
        await interfaceRepository.update(existing_api, api);
    }

    const api_obj = existing_api ?? (await interfaceRepository.insertInterface(
        container.container_id,
        app.api_pkg_id, api));

    await putInterfaceMethods(api_obj, api);
}
export async function putContainerInterfaces(app, container, data) {
    for (const code in container.interfaces) {
        const api_data = data.interfaces?.find(i => i.code.toLowerCase() == code.toLowerCase())
        if (api_data || container.interfaces[code].status === REMOVED_STATUS) {
            continue;
        }
        await removeInterface(container, container.interfaces[code]);
    }
    for (const api of data.interfaces ?? []) {
        await putInterface(app, container, api);
    }
}


/**
 * 
 * @param {SystemDTOInternal} app 
 * @param {*} container 
 */
export async function putContainer(app, container) {
    const existing_container = app.container(container.code);

    if (existing_container && (existing_container.doubles || !isContainersEquals(existing_container, container))) {
        await appRepository.updateContainer(existing_container.container_id,
            container.name,
            container.code,
            container.author,
            container.version,
            container.description,
            container.status
        );
    }

    const container_obj = existing_container ?? (await appRepository.insertContainer(
        app.object_id,
        app.containerPackageId,
        container.name,
        container.code,
        container.author,
        container.version,
        container.description,
        container.status
    ));

    await putContainerInterfaces(app, container_obj, container);
}