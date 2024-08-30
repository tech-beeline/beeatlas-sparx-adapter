import controllers from "../controllers/e2e-process-controllers.mjs";
import SWAGGER, { E2E_LIST_RESOURCE, E2E_RESOURCE } from "../swagger/e2e-process-swagger.mjs";

export default {
    routes: [
        { path: E2E_LIST_RESOURCE, method: "get", controller: controllers.getE2EList },
        { path: E2E_RESOURCE, method: "get", controller: controllers.getE2E },
    ], swagger: SWAGGER
}