import { NotImplemented } from "../../utils/errors.mjs";
import controllers from "../controllers/monitiring-sources-controllers.mjs";
import SWAGGER, { SOURCE_LIST_RESOURCE, SYSTEM_SOURCE_RESOURCE } from "../swagger/monitoring-source-swagger.mjs";


export default {
    routes: [
        { path: SOURCE_LIST_RESOURCE, method: "get", controller: controllers.getAll },
        { path: SOURCE_LIST_RESOURCE, method: "post", controller: controllers.postSource },
        { path: SYSTEM_SOURCE_RESOURCE, method: "get", controller: controllers.getSystemSource },
        { path: SYSTEM_SOURCE_RESOURCE, method: "post", controller: controllers.postSystemSource }
    ], swagger: SWAGGER
}