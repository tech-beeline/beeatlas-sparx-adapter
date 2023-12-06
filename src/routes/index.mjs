import express from 'express'

import DomainRoutes from "./domains-routes.mjs"
import CapabilitiesRoutes from './capabilities-routes.mjs'
import ComponentRoutes from './component-router.mjs';
import InterfaceRoutes from './interface-routes.mjs';
import domainsController from '../controllers/domains-controller.mjs';
import capabilitiesController from '../controllers/capabilities-controller.mjs';

export const Routes = express.Router();

/**
 * 
 * @param {string} path 
 */
function preparePath(path) {
    const path_parts = path.split('/');
    if (path_parts.length === 0)
        return path;
    return path_parts.map(a => a.startsWith('{') && a.endsWith('}') ?
        `:${a.slice(1, a.length - 1)}` :
        a)
        .join('/');
}

class LoadRouteOptions {
    logConsole;
    logSwaggerDescription;
    ifErrorMarkDepricated;
    ifErrorRemove;
}


/**
 * 
 * @param {*} swagger 
 * @param {LoadRouteOptions} options 
 * @returns 
 */
export function routeControllers(swagger, options) {


    const controllers = {
        DomainsController: domainsController,
        CapabilitiesController: capabilitiesController
    }

    let swagger_routes = express.Router();

    for (const path in swagger.paths) {
        let pathProperty = swagger.paths[path];
        for (const method in pathProperty) {

            function onFailedAddController(message) {
                if (options?.logConsole) {
                    console.log(message);
                }
                if (options?.ifErrorRemove) {
                    delete pathProperty[method];
                } else {
                    if (options?.logSwaggerDescription) {
                        pathProperty[method].description = pathProperty[method].description ? message + '\r\n' + pathProperty[method].description : message;
                    }
                    if (options?.ifErrorMarkDepricated) {
                        pathProperty[method].deprecated = "true";
                    }
                }
            }

            const controller_name = pathProperty[method]["x-swagger-router-controller"]
            if (!controller_name) {
                onFailedAddController(`Swagger: ${method} ${path} - не указан контроллер (x-swagger-router-controller)`);
                continue;
            }
            const controller = controllers[controller_name];
            if (!controller) {
                onFailedAddController(`Не найден контроллер с именем ${controller_name}`)
                continue;
            }
            if (!pathProperty[method].operationId) {
                onFailedAddController(`Swagger: ${method} ${path} - не указан operationId`)
                continue;
            }
            const controller_operation = controller[pathProperty[method].operationId];
            if (!controller_operation) {
                onFailedAddController(`В контролере ${controller_name} не найден метод ${pathProperty[method].operationId}`)
                continue;
            }
            if (typeof controller_operation !== "function") {
                onFailedAddController(`В контролере ${controller_name} ${controller_operation} не явлется функцией`)
                continue;
            }


            swagger_routes[method](preparePath(path), controller_operation);
        }
    }
    return swagger_routes;
}


Routes.route('/domains', DomainRoutes);



//Routes.use('/capabilities', CapabilitiesRoutes)
//Routes.use('/components', ComponentRoutes)
//Routes.use('/interfaces', InterfaceRoutes)



export default Routes;