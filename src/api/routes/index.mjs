import express from 'express'
import capabilitiesRoutes from './capabilities-routes.mjs'
import tcRoutes from './tc-routes.mjs';
import systemsRoutes from './systems-routes.mjs';

const apiRouter = express.Router();

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


/**
 * @type { Array<{routes:Array<{path, method, controller}>, swagger}>}
 */
const API_ROUTES = {
    "capability-service": capabilitiesRoutes,
    "tc-service": tcRoutes,
    "system-service": systemsRoutes
}

/**
 * 
 * @param {*} controller 
 * @returns 
 */
function createControllerDecorator(controller) {
    return async (request, response, next) => {
        try {
            await controller(request, response, next)
        } catch (error) {
            console.error(error)
            return response.status(error.status ?? 500).json({ message: error.message })
        }
    }
}

for (const service_name in API_ROUTES) {
    apiRouter.use(`/swagger-ui/${service_name}`, express.static('./src/resources/html/swagger-page.html'));
    /**
     * @type {routes:Array<{path, method, controller}>, swagger}
     */
    const service = API_ROUTES[service_name];
    const specification = service.swagger;
    apiRouter.use(`/swagger-ui/${service_name}/swagger.json`, (_, res) => res.json(specification));
    
    service.routes.forEach(route => {
        apiRouter[route.method](preparePath(route.path), createControllerDecorator(route.controller))
    });
}

export default apiRouter;