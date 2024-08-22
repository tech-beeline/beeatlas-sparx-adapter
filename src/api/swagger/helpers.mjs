export const stringProperty = (description, { example, format } = {}) => ({ type: "string", description: description, format: format ?? undefined, example: example ?? undefined });
export const booleanProperty = (description) => ({ type: "boolean", description: description });
export const dateTimeProperty = (description) => ({ type: "string", description: description, format: "date-time" });

export const schemasRef = (name) => ({ $ref: `#/components/schemas/${name}` });
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
    description : "Не правильный запрос",
    content:{
        "application/json" : {
            schema : {
                type: "object",
                properties:{ 
                    message: {
                        type: "string",
                        example : "The code is not specified"
                    }
                }
            }
        }
    }
}