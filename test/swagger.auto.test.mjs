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
        ret.push({ parameter: parameter.name, value: parameter.example, response: "200" })
    }
    if (parameter.examples) {
        for (const example_name in parameter.examples) {
            ret.push({ parameter: parameter.name, value: parameter.examples[example_name].value ? parameter.examples[example_name].value : parameter.examples[example_name], response: example_name });
        }
    }
    return ret;
}

/**
 * 
 * @param {{method: "get" |"post" | "put"
 * path: string, expectedResponse : {
 *      description: string, status: string
 *      }
 * }  } sample 
 */
function buildTest(sample) {

    function add_expect_content(test) {
        if (sample.expectedResponse.content?.["application/json"]) {
            return test.expect('Content-Type', /application\/json/);
        }
        return test;
    }

    function add_expect_body(test) {
        return test;
    }

    const test_name = `${sample.method} ${sample.path} expected [${sample.expectedResponse.status}] ${sample.expectedResponse.description}`
    let avaliable_methods = {
        get: (done) => {
            add_expect_body(
                add_expect_content(
                    request(app)[sample.method](sample.path)
                        .expect(Number(sample.expectedResponse.status))))
                .end(done);
        },
        post: (done) => {
            add_expect_body(
                add_expect_content(
                    request(app)[sample.method](sample.path)
                        .expect(Number(sample.expectedResponse.status))))
                .end(done);
        },
        default: (done) => {
            throw Error(`TEST NOT IMPLEMENTED`);
        }
    };

    //console.log(`${sample.method} ${sample.path} expected (${sample.expectedResponse.status})${sample.expectedResponse.description}`);
    it(test_name, (done) => {
        let test_fn = avaliable_methods[sample.method.toLowerCase()] ?? avaliable_methods.default;
        test_fn(done);
    });
}

for (const tag in tagsSamples) {
    describe(tagsSamples[tag].description ?? tag, () => {
        for (const test of tagsSamples[tag].tests) {
            describe(test.definition.summary ?? `${test.method} ${test.path}`, () => {
                let path_parameters = (test.definition.parameters ?? []).filter(p => p.in == "path")
                let prepared_examples = []
                for (const p of path_parameters) {
                    let examples = preaprePathParameterSamples(p);
                    for (const ex of examples) {
                        prepared_examples.push({ name: ex.parameter, value: ex.value, response: ex.response });
                    }
                }

                for (let response in test.definition.responses) {
                    let prepared_path = test.path;

                    for (let param of prepared_examples.filter(p => p.response == response)) {
                        prepared_path = prepared_path.replace(`{${param.name}}`, param.value)
                    }

                    buildTest({
                        method: test.method, path: prepared_path,
                        expectedResponse: { status: response, ...test.definition.responses[response] }
                    })
                    //console.log(`${test.method} ${prepared_path} expected ${test.definition.responses[response].description} `);
                }
            })


            /*
            for (let param of prepared_examples) {
                prepared_path = prepared_path.replace(`{${param.name}}`, param.value)
            }*/


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