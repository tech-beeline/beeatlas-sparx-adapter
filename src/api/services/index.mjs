import { E2EProcessService } from "./e2e-processes-service/index.mjs";
import { ObservabilityService } from "./observability-service/index.mjs";
import { ScenariosService } from "./scenarios-service/index.mjs";
import { SystemService } from "./systems-service/index.mjs"
import { TechnicalCapabiliiesService } from "./tc-service/index.mjs";
export { GET_ALL_SYSTEMS_HANDLERS } from "./systems-service/get-all-systems.mjs";

const SystemServiceInstance = new SystemService();
export const E2EProcessesServiceInstance = new E2EProcessService();
export const ScenariosServiceInstance = new ScenariosService();
export const TCServiceInstance = new TechnicalCapabiliiesService();
export { SystemServiceInstance }
export const ObservabilityServiceInstance = new ObservabilityService();