import capabilitiesControllers from "../controllers/capabilities-controllers.mjs";
import SWAGGER, { CAPABILITY_LIST_RESOURCE, CAPABILITY_RESOURCE } from "../swagger/capabilities-swagger.mjs";


export default {
    routes: [
        { path: CAPABILITY_LIST_RESOURCE, method: "get", controller: capabilitiesControllers.getAll },
        { path: CAPABILITY_RESOURCE, method: "get", controller: capabilitiesControllers.getByCode }
    ], swagger: SWAGGER
}