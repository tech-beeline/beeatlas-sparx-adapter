import SwaggerDefinition from "../src/routes/swagger.mjs";


class TagTestSpecifiction {
    path;
    method;
    usecases;
    constructor({ path, method }) {
        this.path = path;
        this.method = method;
    }
}

class APITest {
    constructor(path, method, responses) {
        this.path = path;
        this.method = method;
        this.addResponsesUsecases(responses)
    }
    addResponsesUsecases(responses) {
        for (const responseStatus in responses) {
            for( const contentType in  responses[responseStatus] ){
                
            }
        }
    }
    path;
    method;
    uasecases = [];
}

class OPENAPITag {
    constructor(name) {
        this.name = name;
    }
    name;
    /**
     * @type {APITest[]}
     */
    tests = [];
}


let OPENAPI_DEFINITION = SwaggerDefinition.load();

let tagsSamples = {};


OPENAPI_DEFINITION.tags.forEach(element => {
    tagsSamples[element.name] = new OPENAPITag(element.name);
});



for (const path in OPENAPI_DEFINITION.paths) {
    for (const method in OPENAPI_DEFINITION.paths[path]) {
        const tags = OPENAPI_DEFINITION.paths[path][method].tags ?? ["default"];

        for (const tag of tags) {
            tagsSamples[tag] = tagsSamples[tag] ?? new OPENAPITag(tag);
            tagsSamples[tag].tests.push(new APITest(path, method, OPENAPI_DEFINITION.paths[path][method].responses));
        }
    }
}


/**
 * @type {OPENAPITag[]}
 */
const OPENAPI_TAGS = Object.values(tagsSamples)


console.log('!')