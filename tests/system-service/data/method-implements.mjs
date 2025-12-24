import { addApi, addContainer, addMethod } from "./utils.mjs";

export const CREATE_METHOD_WITH_TC = {
    name: "create-method-tc",
    code: "create-method-tc",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-empty-system",
    status: "Proposed",
    "links": {
        "self": "/api/v4/systems/create-method-tc",
        "purpose": "/api/v4/systems/create-method-tc/purpose",
        "e2e": "/api/v4/systems/create-method-tc/e2e",
        "assessments": "/api/v4/systems/create-method-tc/e2e"
    }
};

addMethod(
    addApi(
        addContainer(CREATE_METHOD_WITH_TC, { name: "Mordor", localCode: "mordor" }),
        { name: "orcs", localCode: "orcs" }),
    {
        name: "GET /orcs",
        tc : "FDMSHOWCASEAPP.001"
    });