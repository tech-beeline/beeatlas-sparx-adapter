export class ProvidedInterface {

}
export class Application {
    name;
    cmdb;
    constructor(obj = {}) {
        for (const k in this) {
            this[k] = obj[k] ?? this[k];
        }
    }
}

export class ApplicationCatalog {
    applications = {};
    #objectMap = {}
    constructor({ providedInterfaces } = {}) {
        if (providedInterfaces) {
            for (const row of providedInterfaces) {
                const app = (this.applications[row.cmdb] = this.applications[row.cmdb] ?? new Application(row));
                this.#objectMap[row.interface_id] = app;
                this.#objectMap[row.component_id] = app;
            }
        }
    }

    byObjectId( id ){
        return this.#objectMap[id];
    }

}