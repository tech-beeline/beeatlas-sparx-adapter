import { NotImplemented } from "../../utils/errors.mjs";
import controllers from "../controllers/systems-controllers.mjs";
import SWAGGER, { SYSTEM_LIST_RESOURCE, SYSTEM_PURPOSE_RESOURCE, SYSTEM_RESOURCE } from "../swagger/systems-swagger.mjs";


export default {
    routes: [
        { path: SYSTEM_LIST_RESOURCE, method: "get", controller: controllers.getAll },
        { path: SYSTEM_RESOURCE, method: "get", controller: controllers.getByCode },
        { path: SYSTEM_PURPOSE_RESOURCE, method: "get", controller: controllers.getPurpose },
    ], swagger: SWAGGER
}