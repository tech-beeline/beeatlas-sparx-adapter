export class ProvidedInterface {

}
export class Application {
    name;
    cmdb;
    component_id;
    #ref;
    constructor(obj = {}) {
        for (const k in this) {
            this[k] = obj[k] ?? this[k];
        }
        this.#ref = new ApplicationRef( this );
    }
    get $ref(){
        return this.#ref;
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

    /** @returns {Application} */
    byObjectId( id ){
        return this.#objectMap[id];
    }

}

export class ApplicationRef{
    #application
    $ref;
    constructor( app ){
        this.#application = app;
        this.$ref = `#/application/${app.cmdb}`
    }
    get server(){
        return this.#application;
    }
}