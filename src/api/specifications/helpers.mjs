import { API_VERSION, CONTACT } from "../../resources/const.mjs";

export const stringProperty = (description, { example, format } = {}) => ({ type: "string", description: description, format: format ?? undefined, example: example ?? undefined });
export const numberProperty = (description, { example, format } = {}) => ({ type: "number", description: description, format: format ?? undefined, example: example ?? undefined });
export const integerProperty = (description, { example, format } = {}) => ({ type: "integer", description: description, format: format ?? undefined, example: example ?? undefined });
export const booleanProperty = (description) => ({ type: "boolean", description: description });
export const dateTimeProperty = (description) => ({ type: "string", description: description, format: "date-time" });

export const schemasRef = (name) => ({ $ref: `#/components/schemas/${name}` });

export const AUTHOR_PROPERTY = {

}

export const buildServiceSwagger = (title, description, contact, version, paths, components) => (
    {
        openapi: "3.0.3",
        info: {
            title: title,
            description: description,
            contact: contact,
            version: version
        },
        tags: [{ name: title, description: description }],
        paths: paths,
        components: components
    })

export const BAD_REQUST_RESPONSE = {
    description: "Не правильный запрос",
    content: {
        "application/json": {
            schema: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        example: "The code is not specified"
                    }
                }
            }
        }
    }
}

export class SimpleServiceSpecification {
    openapi = "3.0.3"
    info;
    tags = [];
    paths = {};
    components = {
        schemas: {

        }
    }

    constructor(title, description, version = API_VERSION, contact = CONTACT) {
        this.info = {
            title: title,
            description: description,
            version: version,
            contact: CONTACT
        }
        this.tags.push({ name: title, description: description })
    }
    defineOperation(path, method, spec) {
        const pathSpec = this.paths[path] ?? (this.paths[path] = {});
        pathSpec[method] = { ...spec, tags: this.tags?.map(t => t.name) };
        return this;
    }
    defineGet(path, spec) {
        return this.defineOperation(path, "get", spec);
    }
    definePut(path, spec) {
        return this.defineOperation(path, "put", spec);
    }
    definePost(path, spec) {
        return this.defineOperation(path, "post", spec);
    }
    defineDelete(path, spec) {
        return this.defineOperation(path, "delete", spec);
    }
    defineEntitySchema(name, schema) {
        this.components.schemas[name] = schema;
        return { $ref: `#/components/schemas/${name}` };
    }
}

export function arraySchema(items) {
    return {
        type: "array",
        items: items
    }
}


export class JSONOperation {
    tags;
    summary;
    parameters;
    requestBody;
    responses = {};
    controller;


    constructor(summary, parameters, bodySchema, okResponseSchema, controller) {
        this.summary = summary;
        this.parameters = parameters ?? undefined;
        this.responses[200] = okResponseSchema ? {
            content: {
                "application/json": { schema: okResponseSchema }
            }
        } : {
            content: {
                "html/text": {
                    schema: {
                        type: "string"
                    }
                }
            }
        }
        if (bodySchema) {
            this.requestBody = {
                content: {
                    "application/json": { schema: bodySchema }
                }
            }
        }
        this.controller = controller;
    }
    setContoller(controller) {
        this.controller = controller;
        return this;
    }
}

export class GetJSONOperation extends JSONOperation {
    constructor(summary, parameters, okResponseSchema, controller) {
        super(summary, parameters, null, okResponseSchema, controller)
    }
}

export function pathParameter(name, description, example) {
    return {
        name: name,
        in: "path",
        description: description,
        required: true,
        example: example
    }
}

export function queryParameter(name, description, required, examaple) {
    return {
        name: name,
        in: "query",
        description: description,
        required: required,
        example: examaple
    }
}