import { NotImplemented } from "../../../../utils/errors.mjs";
import { Container } from "../../../model/system.mjs";
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
        this.updateContainer = this.updateContainer.bind(this);
    }

    async updateContainer(systemCode, target, existing) {
        NotImplemented();
    }
}