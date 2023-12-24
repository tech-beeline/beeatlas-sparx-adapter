import express from 'express'

import CAPABILITY_METHODS from './capabilities-routes.mjs';

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


    const controller_methods = {
        CapabilitiesMethods: CAPABILITY_METHODS
    }

    let swagger_routes = express.Router();

    for (const methods in controller_methods) {
        for (let path in controller_methods[methods].paths ?? []) {
            const path_methods = controller_methods[methods].paths[path];

            for (let method in path_methods) {
                let operation = path_methods[method].operation;
                swagger_routes[method](preparePath(path), operation);
            }
        }
    }
    
    return swagger_routes;
}



//Routes.route('/domains', DomainRoutes);



//Routes.use('/capabilities', CapabilitiesRoutes)
//Routes.use('/components', ComponentRoutes)
//Routes.use('/interfaces', InterfaceRoutes)



export default Routes;