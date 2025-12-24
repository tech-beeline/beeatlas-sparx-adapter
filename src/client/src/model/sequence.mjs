import { ScenarioInterfaceDTO } from "./scenario/scenario-application-dto.mjs";


export class SequenceCallApiDTO {
    /**@type {string} */
    app_code;
    /**@type {string} */
    container_code;
    /**@type {string} */
    interace_code;
    /**@type {string} */
    tc_code;
    /**@type {string} */
    name;
    /**
     * 
     * @param {ScenarioInterfaceDTO} obj 
     */
    constructor(app_code, container_code, interface_code, name) {
        this.app_code = app_code;
        this.container_code = container_code;
        this.interace_code = interface_code;
        this.name = name;
    }
}

export class MetricSource {
    /**@type {string} */
    url;
    uid;
    template;
    constructor(url) {
        this.url = url;
    }
}

export class SequenceCallMethodDTO {
    /**@type {string} */
    name;
    /**@type {string} */
    description;
    rps;
    latency;
    error_rate;
    metricSource;
    uid;
    constructor(uid, name, description, rps = undefined, latency = undefined, error_rate = undefined) {
        this.uid = uid;
        this.name = name;
        this.description = description;
        this.rps = rps;
        this.latency = latency;
        this.error_rate = error_rate;
    }
}

export class SequenceCallDTO {
    /**@type {SequenceCallApiDTO} */
    api;
    /**@type {SequenceCallMethodDTO} */
    method;
    /**@type {string} */
    description;
    /**@type {string} */
    stereotype;
    /**@type {string} */
    client_code;
    /**@type {SequenceCallDTO[]} */
    sequence;
    constructor(api, method, stereotype, description) {
        this.api = api;
        this.method = method;
        this.description = description;
        this.stereotype = stereotype;
    }
}

export class ScenarioSequenceDTO {
    /**@type {string} */
    code;
    /**@type {string} */
    name;
    /**@type {SequenceCallDTO[]} */
    sequence;
}