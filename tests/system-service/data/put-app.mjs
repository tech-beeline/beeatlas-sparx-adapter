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

export const CREATE_TWO_CONTAINERS = {
    name: "create-two-container",
    code: "create-two-container",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-empty-system",
    status: "Proposed",
    containers: [
        {
            name: "create-one-container backend",
            code: "backend.create-two-container",
            version: "1.0",
            status: "Proposed"
        },
        {
            name: "create-one-container frontend",
            code: "frondend.create-two-container",
            version: "1.0",
            status: "Proposed"
        }
    ],
    links: {
        self: "/api/v4/systems/create-two-container",
        purpose: "/api/v4/systems/create-two-container/purpose",
        e2e: "/api/v4/systems/create-two-container/e2e",
        assessments: "/api/v4/systems/create-two-container/e2e"
    }
};

export const CREATE_CONTAINER_INTERFACE = {
    name: "create-one-container-interface",
    code: "create-one-container-interface",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-empty-system",
    status: "Proposed",
    containers: [
        {
            name: "create-one-container backend",
            code: "backend.create-one-container-interface",
            version: "1.0",
            status: "Proposed",
            interfaces: [
                {
                    name: "mordor API",
                    code: "morder.backend.create-one-container-interface",
                    status: "Proposed",
                    version: "1.0",
                    methods: []
                }
            ]
        }
    ],
    links: {
        self: "/api/v4/systems/create-one-container-interface",
        purpose: "/api/v4/systems/create-one-container-interface/purpose",
        e2e: "/api/v4/systems/create-one-container-interface/e2e",
        assessments: "/api/v4/systems/create-one-container-interface/e2e"
    }
};

export const CREATE_SLA = {
    name: "create-sla",
    code: "create-sla",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-empty-system",
    status: "Proposed",
    containers: [
        {
            name: "Mordor container",
            code: "mordor.create-sla",
            description: "Орда. Родная, злобная, твоя",
            version: "1.0",
            status: "Proposed",
            interfaces: [
                {
                    name: "Orc API",
                    code: "orcs_api.mordor.create-sla",
                    description: "Родился орком - защищай мордор!",
                    version: 1.0,
                    status: "Proposed",
                    methods: [
                        {
                            name: "GET /orcs",
                            description: "Получить всех орокв",
                        },
                        {
                            name: "GET /orcs/{nickname}",
                            description: "Получить орка по кличке",
                            rps: "10",
                            latency: "1000",
                            error_rate: "0.1"
                        },
                        {
                            name: "PUT /orcs/{nickname}",
                            description: "Обновить орка по кличке",
                            rps: "10",
                            error_rate: "0.1"
                        }
                    ]
                }
            ]
        }
    ],
    links: {
        self: "/api/v4/systems/create-sla",
        purpose: "/api/v4/systems/create-sla/purpose",
        e2e: "/api/v4/systems/create-sla/e2e",
        assessments: "/api/v4/systems/create-sla/e2e"
    }
};

export const OLD_CONTAINER = {
    name: "Mordor container",
    code: "mordor.change-container-code",
    description: "Орда. Родная, злобная, твоя",
    version: "1.0",
    status: "Proposed",
    interfaces: [
        {
            name: "Orc API",
            code: "orcs_api.mordor.change-container-code",
            description: "Родился орком - защищай мордор!",
            version: 1.0,
            status: "Proposed",
            methods: [
                {
                    name: "GET /orcs",
                    description: "Получить всех орокв",
                },
                {
                    name: "GET /orcs/{nickname}",
                    description: "Получить орка по кличке",
                    rps: "10",
                    latency: "1000",
                    error_rate: "0.1"
                },
                {
                    name: "PUT /orcs/{nickname}",
                    description: "Обновить орка по кличке",
                    rps: "10",
                    error_rate: "0.1"
                }
            ]
        }
    ]
};

export const NEW_CONTAINER = {
    name: "Mordor container",
    code: "ext_mordor.change-container-code",
    description: "Орда. Родная, злобная, твоя",
    version: "1.0",
    status: "Proposed",
    interfaces: [
        {
            name: "Orc API",
            code: "ext_orcs_api.ext_mordor.change-container-code",
            description: "Родился орком - защищай мордор!",
            version: 1.0,
            status: "Proposed",
            methods: [
                {
                    name: "GET /orcs",
                    description: "Получить всех орокв",
                },
                {
                    name: "GET /orcs/{nickname}",
                    description: "Получить орка по кличке",
                    rps: "10",
                    latency: "1000",
                    error_rate: "0.1"
                },
                {
                    name: "PUT /orcs/{nickname}",
                    description: "Обновить орка по кличке",
                    rps: "10",
                    error_rate: "0.1"
                }
            ]
        }
    ]
}

export const CHANGE_CONTAINER_CODE = {
    name: "change-container-code",
    code: "change-container-code",
    version: "1.0",
    author: "Игорь Воронин",
    description: "Изменение кода (удаление старого контейнера и добавление нового с новым кодом)",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-existing-container",
    status: "Proposed",
    containers: [
        OLD_CONTAINER
    ],
    links: {
        self: "/api/v4/systems/change-container-code",
        purpose: "/api/v4/systems/change-container-code/purpose",
        e2e: "/api/v4/systems/change-container-code/e2e",
        assessments: "/api/v4/systems/change-container-code/e2e"
    }
}

export const REMOVE_DOUBLES = {
    name: "remove-doubles",
    code: "remove-doubles",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-existins-api",
    status: "Proposed",
    containers: [
        {
            name: "Mordor container",
            code: "ext_mordor.remove-doubles",
            description: "Орда. Родная, злобная, твоя",
            version: "1.0",
            status: "Proposed",
            interfaces: [
                {
                    name: "Orc API",
                    code: "ext_orcs_api.ext_mordor.remove-doubles",
                    description: "Родился орком - защищай мордор!",
                    version: 1.0,
                    status: "Proposed",
                    methods: [
                        {
                            name: "GET /orcs",
                            description: "Получить всех орков",
                        },
                        {
                            name: "GET /orcs/{nickname}",
                            description: "Получить орка по кличке",
                            rps: "10",
                            latency: "1000",
                            error_rate: "0.1"
                        },
                        {
                            name: "PUT /orcs/{nickname}",
                            description: "Обновить орка по кличке",
                            rps: "10",
                            error_rate: "0.1"
                        }
                    ]
                }
            ]
        }
    ],
    links: {
        self: "/api/v4/systems/remove-doubles",
        purpose: "/api/v4/systems/remove-doubles/purpose",
        e2e: "/api/v4/systems/remove-doubles/e2e",
        assessments: "/api/v4/systems/remove-doubles/e2e"
    }
}


export const CONTAINER_WITHOUT_CODE = {
    name: "remove-doubles",
    code: "remove-doubles",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-existins-api",
    status: "Proposed",
    containers: [
        {
            name: "Mordor container",
            description: "Орда. Родная, злобная, твоя",
            version: "1.0",
            status: "Proposed"
        }
    ]
}

export const CONTAINER_NULL_CODE = {
    name: "remove-doubles",
    code: "remove-doubles",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-existins-api",
    status: "Proposed",
    containers: [
        {
            name: "Mordor container",
            code: null,
            description: "Орда. Родная, злобная, твоя",
            version: "1.0",
            status: "Proposed"
        }
    ]
}

export const CONTAINER_EMPTY_CODE = {
    name: "remove-doubles",
    code: "remove-doubles",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-existins-api",
    status: "Proposed",
    containers: [
        {
            name: "Mordor container",
            code: "",
            description: "Орда. Родная, злобная, твоя",
            version: "1.0",
            status: "Proposed"
        }
    ]
}

export const INTERFACE_WITHOUT_CODE = {
    name: "remove-doubles",
    code: "remove-doubles",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-existins-api",
    status: "Proposed",
    containers: [
        {
            name: "Mordor container",
            code: "test.remove-doubles",
            description: "Орда. Родная, злобная, твоя",
            version: "1.0",
            status: "Proposed",
            interfaces: [
                {
                    name: "mordor API",
                    status: "Proposed",
                    version: "1.0",
                    methods: []
                }
            ]
        }
    ]
}

export const INTERFACE_NULL_CODE = {
    name: "remove-doubles",
    code: "remove-doubles",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-existins-api",
    status: "Proposed",
    containers: [
        {
            name: "Mordor container",
            code: "test.remove-doubles",
            description: "Орда. Родная, злобная, твоя",
            version: "1.0",
            status: "Proposed",
            interfaces: [
                {
                    name: "mordor API",
                    code: null,
                    status: "Proposed",
                    version: "1.0",
                    methods: []
                }
            ]
        }
    ]
}

export const INTERFACE_EMPTY_CODE = {
    name: "remove-doubles",
    code: "remove-doubles",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/update-existins-api",
    status: "Proposed",
    containers: [
        {
            name: "Mordor container",
            code: "test.remove-doubles",
            description: "Орда. Родная, злобная, твоя",
            version: "1.0",
            status: "Proposed",
            interfaces: [
                {
                    name: "mordor API",
                    code: "",
                    status: "Proposed",
                    version: "1.0",
                    methods: []
                }
            ]
        }
    ]
};

export const ADD_INTERFACE_METHOD = {
    "name": "add-method",
    "code": "add-method",
    "version": "1.0",
    "author": "Игорь Воронин",
    "FQName": "IT-Landscape Catalog/DEV_TEST/Tests/update-existins-api",
    "status": "Proposed",
    "containers": [
        {
            name: "Mordor",
            code: "mordor.add-method",
            version : "1.0",
            status: "Proposed",
            interfaces: [
                {
                    name : "orcs api",
                    code : "orcs.mordor.add-method",
                    version: "1.0",
                    status: "Proposed",
                    methods: [
                        {
                            name : "GET /orcs",
                            implements : "FDMSHOWCASEAPP.001",
                            rps: "10"
                        }
                    ]
                }
            ]
        }
    ],
    "links": {
        "self": "/api/v4/systems/add-method",
        "purpose": "/api/v4/systems/add-method/purpose",
        "e2e": "/api/v4/systems/add-method/e2e",
        "assessments": "/api/v4/systems/add-method/e2e"
    }
}