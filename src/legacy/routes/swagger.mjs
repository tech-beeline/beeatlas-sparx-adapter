import SWAGGER_TEMPLATE from '../swagger/swagger-template.mjs';
import CAPABILITY_METHODS from './capabilities-routes.mjs';
import COMPONENTS_METHODS from './components-routes.mjs';
import TC_METHODS from './technical-capabilities-routes.mjs';
import DASHBOARD_METHODS from './dashboard-routes.mjs';
import INTERFACES_ROUTES from './interface-routes.mjs';
import E2E_PROCESS_ROUTES from './e2e-process-routes.mjs';
import MONITORING_ROUTES from './monitoring-routes.mjs'
import TELEMETRY_ROUTES from './telemetry-routes.mjs'
import DATA_MODEL_ROUTES from './data-model-routes.mjs';
import SLA_ROUTES from './sla-routes.mjs';
import { NotImplemented } from '../../utils/errors.mjs';


export const ROUTES = [
    SLA_ROUTES,
    MONITORING_ROUTES,
    COMPONENTS_METHODS,
    DATA_MODEL_ROUTES,
    CAPABILITY_METHODS,
    TC_METHODS,
    DASHBOARD_METHODS,
    INTERFACES_ROUTES,
    E2E_PROCESS_ROUTES,
    TELEMETRY_ROUTES
]

export const ROUTES_MAP = {
    "capability-service": {
        title: CAPABILITY_METHODS.tag,
        description: CAPABILITY_METHODS.description,
        specification: CAPABILITY_METHODS
    }
}

function joinSchemas(target, source) {
    for (const ref in source) {
        if (target[ref]) {
            for (const ref_prop in source[ref].properties ?? []) {
                if (!target[ref].properties[ref_prop]) {
                    target[ref].properties[ref_prop] = source[ref].properties[ref_prop];
                    continue;
                }
                if (target[ref].properties[ref_prop].type == source[ref].properties[ref_prop].type) {
                    continue;
                }
                throw Error('not implemented');
            }
            continue;
        }
        target[ref] = source[ref];
    }
    return target;
}

function schemaFromObject(o) {
    if (o instanceof Function) {
        NotImplemented()
    }

    if (Array.isArray(o)) {
        let orefs = {}
        let item_schema = null;

        for (const item of o) {
            const { schema, refs } = schemaFromObject(item);
            joinSchemas(orefs, refs);

            item_schema = item_schema ?? schema;
            if (item_schema.$ref && (item_schema.$ref == schema.$ref)) {
                continue;
            }
            //throw Error('not implemented')
        }
        return {
            schema: {
                type: "array",
                items: item_schema
            },
            refs: orefs
        }
    };
    if (typeof o == "string") {
        return { schema: { type: "string" } }
    }
    if (typeof o == "boolean") {
        return { schema: { type: "boolean" } };
    }
    if (typeof o == "object") {
        const entity_name = o.constructor?.name;

        let properties = {};
        let orefs = {};
        for (const prop in o) {
            if (!o[prop] || o[prop] instanceof Function) {
                continue;
            }
            let { schema, refs } = schemaFromObject(o[prop]);
            joinSchemas(orefs, refs)

            properties[prop] = schema;
        }
        if (entity_name) {
            joinSchemas(orefs, {
                [entity_name]: {
                    type: "object",
                    properties: properties
                }
            })

            return {
                schema: {
                    "$ref": `#/components/schemas/${entity_name}`
                },
                refs: orefs
            }
        }
        return {
            schema: {
                type: "object",
                properties: properties
            }
        }
    }
    return { schema: null }
}

class SwaggerDefinition {
    static prepareContent(content, context) {
        let examples = {}, schemas = {};
        for (const content_type in content) {
            const content_examples = content[content_type].examples;
            for (const example_name in content_examples) {
                let full_name = `${context}${example_name}Example`;
                examples[full_name] = { value: content_examples[example_name] };
                const { schema, refs } = schemaFromObject(content_examples[example_name]);
                joinSchemas(schemas, refs);
                // [ ] поддержать несколько вариантов для разнотиповых примеров
                content[content_type].schema = schema;
                //set ref instead of value
                content_examples[example_name] = { "$ref": `#/components/examples/${full_name}` };
            }
        }
        return { examples, schemas };
    }
    static load(serviceDefinition = ROUTES, title, description, version) {
        let swaggerApi = SWAGGER_TEMPLATE( title, description, version);

        swaggerApi.tags = swaggerApi.tags ?? []
        swaggerApi.paths = swaggerApi.paths ?? {};
        swaggerApi.components = swaggerApi.components ?? { schemas: {}, examples: {} }

        for (let tag of serviceDefinition) {
            swaggerApi.tags[tag.tag] = swaggerApi.tags[tag.tag] ?? { name: tag.tag, description: tag.description }
            for (const path in tag.paths) {
                swaggerApi.paths[path] = swaggerApi.paths[path] ?? {};
                const methods = tag.paths[path];

                for (const method in methods) {
                    swaggerApi.paths[path][method] = methods[method];
                    swaggerApi.paths[path][method].tags = [tag.tag];
                    if (methods[method].requestBody) {
                        const { examples, schemas } = this.prepareContent(methods[method].requestBody.content, methods[method].operation.name + "Body")
                        Object.assign(swaggerApi.components.examples, examples);
                        Object.assign(swaggerApi.components.schemas, schemas);
                    }


                    for (const response in methods[method].responses) {
                        for (const content_type in methods[method].responses[response].content) {
                            if (!methods[method].operation) {
                                continue;
                            }
                            const { examples, schemas } = this.prepareContent(methods[method].responses[response].content, methods[method].operation.name)
                            Object.assign(swaggerApi.components.examples, examples);
                            Object.assign(swaggerApi.components.schemas, schemas);
                        }
                    }
                }
            }
        }

        swaggerApi.tags = Object.values(swaggerApi.tags);

        return swaggerApi;
    }
}


export default SwaggerDefinition;