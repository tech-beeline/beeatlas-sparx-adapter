export class ScenarioMethod {
    name;
    uid;
}

export class ScenarioInterfaceDTO {
    /**@type {number} */
    id;
    /**@type {string} */
    name;
    /**@type {string} */
    app_code;
    code;
    uid;
    #app;
    /**@type {ScenarioMethod[]} */
    methods = [];
    /**@type {"sparx"|"c4"}*/
    source;
    /**@type {ScenarioApplicationDTO} */
    get application() {
        return this.#app;
    }
    set application(app) {
        this.#app = app;
    }
    /**
     * 
     * @param {*} obj 
     * @param {ScenarioApplicationDTO} app 
     */
    constructor(obj, app) {

        this.id = obj.api_id ?? obj.id;
        this.name = obj.api_name ?? obj.name;
        this.code = obj.api_code ?? obj.code;
        this.uid = obj.api_uid ?? obj.uid;
        this.app_code = obj.app_code;
        this.source = obj.source;
        if (obj.methods && obj.methods.length) {
            this.methods = obj.methods;
        }

        if (app) {
            this.#app = app;
            app.addInterface(this);
        }
    }
    get title() {
        return this.code ? `[${this.code}] ${this.name}` : `${this.name}`;
    }
}

export class ScenarioApplicationDTO {
    /**@type {string} */
    name;
    code;
    constructor(obj) {
        Object.assign(this, obj);
    }
    /** @type {ScenarioApplicationDTO} */
    static fromObject(obj) {
        return Object.assign(new ScenarioApplicationDTO(), obj);
    }
    get title() {
        return `[${this.code}] ${this.name}`;
    }
    /**@type {ScenarioInterfaceDTO[]} */
    interfaces = [];
    /**
     * 
     * @param {*} api 
     */
    addInterface(api) {
        this.interfaces.push(api);
    }
}