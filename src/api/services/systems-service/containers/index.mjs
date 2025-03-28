import { NotImplemented } from "../../../../utils/errors.mjs";
import { InterfacesRepository, SystemsRepository } from "../../../repositories/index.mjs";
import eaRepository from "../../../repositories/sparx-ea-repository/ea-repository.mjs";

export class SystemContainerService {
    /** @type {SystemsRepository} */
    repository;
    /** @type {InterfacesRepository} */
    interfacesRepository;
    constructor(repository, interfacesRepository) {
        this.repository = repository ?? (new SystemsRepository());
        this.interfacesRepository = interfacesRepository ?? (new InterfacesRepository());

        this.deleteContainer = this.deleteContainer.bind(this);
        this.addContainer = this.addContainer.bind(this);
        this.updateContainer = this.updateContainer.bind(this);
    }
    async deleteContainer(systemCode, containerCode) {
        const existingContainer = await this.repository.selectSystemContainerByCode( systemCode, containerCode);
        if( !existingContainer ) throw Error(`Не найден контейнер с кодом="${containerCode}" (код системы = "${systemCode}")`);

        await this.interfacesRepository.deleteContainerInterfaces( existingContainer.container_id);
        eaRepository

        NotImplemented();
    }

    async addContainer(systemCode, container) {
        NotImplemented();
    }

    async updateContainer(systemCode, container, existing) {
        NotImplemented();
    }
}