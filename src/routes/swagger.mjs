import fs from 'fs'
import CAPABILITY_SWAGGER from '../swagger/capability-api.mjs';
import CAPABILITY_METHODS from './capabilities-routes.mjs';
import COMPONENTS_METHODS from './components-routes.mjs';
import TC_METHODS from './technical-capabilities-routes.mjs';
import DASHBOARD_METHODS from './dashboard-routes.mjs';


export const CONTROLLERS = [
    CAPABILITY_METHODS,
    COMPONENTS_METHODS,
    TC_METHODS,
    DASHBOARD_METHODS
]

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
            throw Error('not implemented')
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
            if (!o[prop]) {
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
    static load() {
        let swaggerApi = CAPABILITY_SWAGGER;

        swaggerApi.tags = swaggerApi.tags ?? []
        swaggerApi.paths = swaggerApi.paths ?? {};
        swaggerApi.components = swaggerApi.components ?? { schemas: {}, examples: {} }

        for (let tag of CONTROLLERS) {
            swaggerApi.tags[tag.tag] = swaggerApi.tags[tag.tag] ?? { name: tag.tag, description: tag.description }
            for (const path in tag.paths) {
                swaggerApi.paths[path] = swaggerApi.paths[path] ?? {};
                const methods = tag.paths[path];

                for (const method in methods) {
                    swaggerApi.paths[path][method] = methods[method];
                    swaggerApi.paths[path][method].tags = [tag.tag];

                    for (const response in methods[method].responses) {
                        for (const content_type in methods[method].responses[response].content) {
                            const response_examples = methods[method].responses[response].content[content_type].examples;
                            for (const example_name in response_examples) {
                                let full_name = `${methods[method].operation.name}${example_name}Example`;
                                swaggerApi.components.examples[full_name] = { value: response_examples[example_name] };

                                const { schema, refs } = schemaFromObject(response_examples[example_name]);
                                joinSchemas(swaggerApi.components.schemas, refs);

                                methods[method].responses[response].content[content_type].schema = schema;

                                response_examples[example_name] = { "$ref": `#/components/examples/${full_name}` }
                            }
                        }
                    }

                    //swaggerApi.paths[path][method]["x-swagger-router-controller"] = controller;
                }
            }
        }

        swaggerApi.tags = Object.values(swaggerApi.tags);



        return swaggerApi;
        /*
        return async (request, response) => {
            return response.json(swaggerApi);
        }
        */
    }
}


export default SwaggerDefinition;