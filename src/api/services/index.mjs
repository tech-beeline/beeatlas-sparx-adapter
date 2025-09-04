import { SparxRepository } from "../repositories/index.mjs";
import { E2EProcessService } from "./e2e-processes-service/index.mjs";
import { ObservabilityService } from "./observability-service/index.mjs";
import { ScenariosService } from "./scenarios-service/index.mjs";
import { SystemService } from "./systems-service/index.mjs"
import { TechnicalCapabiliiesService } from "./tc-service/index.mjs";
export { GET_ALL_SYSTEMS_HANDLERS } from "./systems-service/get-all-systems.mjs";
export { CapabilityService, capabilitServiceInstance } from './capability-service/index.mjs'
export { MonitiringSourcesServices } from './monitiring-sources-service.mjs'
export { StructurizrService } from './structurizr-service/index.mjs'


const SystemServiceInstance = new SystemService();
export const E2EProcessesServiceInstance = new E2EProcessService();
export const ScenariosServiceInstance = new ScenariosService();
export const TCServiceInstance = new TechnicalCapabiliiesService();
export const ObservabilityServiceInstance = new ObservabilityService();

export { SystemServiceInstance, TechnicalCapabiliiesService, SystemService }

export class BoardServicesConfig {
    sparx;
    constructor({ sparx } = {}) {
        this.sparx = sparx;
    }
}

export class BoardServices {
    sparxRepository;
    capabilityService;
    /**
     * 
     * @param {BoardServicesConfig} config 
     */
    constructor(config) {
        this.sparxRepository = new SparxRepository(config?.sparx);
    }
};

