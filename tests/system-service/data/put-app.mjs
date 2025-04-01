export const CREATE_ONE_CONTAINER = {
    name: "create-one-container",
    code: "create-one-container",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-empty-system",
    status: "Proposed",
    containers: [{
        name: "create-one-container backend",
        code: "backend.create-one-container",
        version: "1.0",
        status: "Proposed"
    }],
    links: {
        assessments: "/api/v4/systems/create-one-container/e2e",
        e2e: "/api/v4/systems/create-one-container/e2e",
        purpose: "/api/v4/systems/create-one-container/purpose",
        self: "/api/v4/systems/create-one-container",
    }
};