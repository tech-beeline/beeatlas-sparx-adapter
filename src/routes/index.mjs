import express from 'express'

import CAPABILITY_METHODS from './capabilities-routes.mjs';
import COMPONENTS_METHODS from './components-routes.mjs';
import { ROUTES } from './swagger.mjs';
import { createPromDecorator } from '../metrics/middleware.mjs';

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

 
    let swagger_routes = express.Router();

    for (const methods in ROUTES) {
        for (let path in ROUTES[methods].paths ?? []) {
            const path_methods = ROUTES[methods].paths[path];

            for (let method in path_methods) {
                let operation = createPromDecorator( path_methods[method].operation, path, method);
                swagger_routes[method](preparePath(path), operation);
            }
        }
    }
    
    return swagger_routes;
}

export default Routes;