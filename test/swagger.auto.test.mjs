process.env.NODE_ENV = 'test';

import env from '../src/env.mjs'
import request from 'supertest'
import app from '../src/load-app.mjs'

import SwaggerDefinition from "../src/routes/swagger.mjs";

const API_DEFINITION = SwaggerDefinition.load();

let tagsSamples = {};

API_DEFINITION.tags.forEach(element => {
    tagsSamples[element.name] = { tests: [], ...element };
});


for (const path in API_DEFINITION.paths) {
    for (const method in API_DEFINITION.paths[path]) {
        const tags = API_DEFINITION.paths[path][method].tags ?? ["default"];
        for (const tag of tags) {
            tagsSamples[tag] = tagsSamples[tag] ?? { tests: [] };
            tagsSamples[tag].tests.push({ path: path, method: method, definition: API_DEFINITION.paths[path][method] })
        }
    }
}

/**
 * 
 * @param {{ name: string, in :string, example: { value: string: description:string?} | string?,
 *  examples : {} }} parameter 
 */
function preaprePathParameterSamples(parameter) {
    let ret = [];
    if (parameter.example) {
        ret.push({ parameter: parameter.name, value: parameter.example })
    }
    if (parameter.examples) {
        for (const example_name in parameter.examples) {
            ret.push({ parameter: parameter.name, value: parameter.examples[example_name].value ? parameter.examples[example_name].value : parameter.examples[example_name] })
        }
    }
    return ret;
}

for (const tag in tagsSamples) {
    describe(tagsSamples[tag].description ?? tag, () => {
        for (const test of tagsSamples[tag].tests) {
            let path_parameters = test.definition.parameters ?? [].filter(p => p.in == "path")
            for (const p of path_parameters) {
                let examples = preaprePathParameterSamples(p);
                console.log(examples);
            }
            let prepared_path = test.path;
            for (let param of path_parameters) {
                prepared_path = prepared_path.replace(`{${param.name}}`, "XXXXXX")
            }

            //console.log( `${test.method} ${prepared_path}`);
            /*
            it( `${test.method} ${test.path}`, (done)=>{
                request(app)[test.method](test.path)
                .expect(200)
                .expect('Content-Type', /application\/json/)
                //.expect(GET_DOMAINS_RESPONSE)
                .end(done);
            })
            */
        }
    });
}