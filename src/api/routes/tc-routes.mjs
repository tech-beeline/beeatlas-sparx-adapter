import controllers from "../controllers/tc-controllers.mjs";
import SWAGGER, { TC_LIST_RESOURCE } from "../swagger/tc-swagger.mjs";


export default {
    routes: [
        { path: TC_LIST_RESOURCE, method: "get", controller: controllers.getAll }
    ], swagger: SWAGGER
}