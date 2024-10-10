import { SystemService } from "./systems-service/index.mjs"
export { GET_ALL_SYSTEMS_HANDLERS } from "./systems-service/get-all-systems.mjs";

const SystemServiceInstance = new SystemService();

export { SystemServiceInstance }