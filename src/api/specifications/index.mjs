import express from 'express'
import { NotImplemented } from '../../utils/errors.mjs';
import { API_VERSION, CONTACT } from '../../resources/const.mjs';

import capabilityServiceSpec from './capabilities-service-spec.mjs'
import businessTermServiceSpec from './glossary-service-spec.mjs'
import tcServiceSpec from './tc-service-spec.mjs'
import interfaceServiceSpec from './interfaces-service-spec.mjs'
import systemsServiceSpec from './systems-service-spec.mjs'
import processServiceSpec from './e2e-process-service-spec.mjs'
import observabilityServiceSpec from './observability-service-spec.mjs'
import techRadarServiceSpec from './tech-radar-service-spec.mjs'
import { createControllerDecorator } from '../controllers/controller-decorator.mjs';


const SUMMARY_TITLE = "Полное API управления архитектурными артефактами и представлениями"
const SUMMARY_DESCRIPTION = "Набор сервисов для управления архитектурными справочниками, связями и представлениями"

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
    "capability-service": capabilityServiceSpec,
    "business-terms-service" : businessTermServiceSpec,
    "tc-service": tcServiceSpec,
    "interfaces-service" : interfaceServiceSpec,
    "system-service": systemsServiceSpec,
    "e2e-service": processServiceSpec,
    "observability-service" : observabilityServiceSpec,
    "tech-radar-service" : techRadarServiceSpec,
    /*
    "monitoring-source-service": monitoringSourceReoutes,
    */
}

const SUMMARY_SWAGGER = {
    openapi: "3.0.3",
    info: {
        title: SUMMARY_TITLE,
        description: SUMMARY_DESCRIPTION,
        contact: CONTACT,
        version: API_VERSION
    },
    tags: [
    ],
    paths: {},
    components: {
        schemas: {},
        examples: {},
        responses: {}
    }
}

for (const service_name in API_ROUTES) {
    apiRouter.use(`/swagger-ui/${service_name}`, express.static('./src/resources/html/swagger-page.html'));

    const serviceSpec = API_ROUTES[service_name];
    SUMMARY_SWAGGER.tags.push(...serviceSpec.tags ?? []);
    Object.assign(SUMMARY_SWAGGER.components.schemas, serviceSpec.components.schemas);
    Object.assign(SUMMARY_SWAGGER.components.responses, serviceSpec.components.responses);


    apiRouter.use(`/swagger-ui/${service_name}/swagger.json`, (_, res) => res.json(serviceSpec));

    for (const uri in serviceSpec.paths) {
        const pathSpec = SUMMARY_SWAGGER.paths[uri] = serviceSpec.paths[uri];

        for (const method in pathSpec) {
            apiRouter[method](preparePath(uri), createControllerDecorator(pathSpec[method].controller))
        }
    }
}

apiRouter.use(`/swagger-ui/summary`, express.static('./src/resources/html/swagger-page.html'));
apiRouter.use(`/swagger-ui/summary/swagger.json`, (_, res) => res.json(SUMMARY_SWAGGER));


export default apiRouter;