import { NotImplemented } from "../../utils/errors.mjs";
import { DigitalArchitectRepository } from "./repository.mjs";

export class DigitalArchitectService {
    /** @type {DigitalArchitectRepository} */
    repository;
    constructor(repository) {
        this.repository = repository ?? (new DigitalArchitectRepository());
    }
    async getUsers() {
        return this.repository.selectUsers();
    }

    async getUserActionByLogin(login) {
        return this.repository.selectUserActionsByLogin(login);
    }
}