import { NotImplemented } from "../../../../utils/errors.mjs";
import { interfaceRepository, methodRepository, REALIZATION_CONNECTOR } from "../../../repositories/index.mjs";
import { API_LOAD_DATE_TAG } from "../../../repositories/interfaces-repository/const.mjs";
import eaRepository from "../../../repositories/sparx-ea-repository/ea-repository.mjs";
import { t_object } from "../../../repositories/sparx-ea-repository/index.mjs";
import { REMOVED_STATUS } from "../../../repositories/systems-repository/const.mjs";
import { containerRepository } from "../../../repositories/systems-repository/container-repository.mjs";


export async function removeMethod(api, method) {
    NotImplemented();
}

export async function removeInterface(container, api) {
    for (const m of api.methods ?? []) {
        await removeMethod(api, m);
    }
    await interfaceRepository.delete(container.container_id, api.interface_id);
}

export async function removeContainer(app, container) {
    console.log(`Удаление контейнера ${container.container_code}`);

    for (const api_code in container.interfaces ?? {}) {
        await removeInterface(container.interfaces[api_code]);
    }

    return containerRepository.delete(app.object_id, container.container_id);
}