export const APP_ALONE = {
    name: "AloneApp",
    code: "TEST.ALONE",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/ReadOnly",
    status: "Proposed",
    containers: [],
    links: {
        self: "/api/v4/systems/TEST.ALONE",
        purpose: "/api/v4/systems/TEST.ALONE/purpose",
        e2e: "/api/v4/systems/TEST.ALONE/e2e",
        assessments: "/api/v4/systems/TEST.ALONE/e2e"
    }
};

export const APP_ONE_CONTAINER = {
    name: "AppOneContianer",
    code: "TEST.ONE.Container",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/Tests/ReadOnly",
    status: "Proposed",
    containers: [
        {
            "name": "AppOneContainer backend",
            "code": "backend.TEST.ONE.Container",
            "version": "1.0",
            "description": "Тестовый контейнер",
            "status": "Proposed"
        }
    ],
    links: {
        "assessments": "/api/v4/systems/TEST.ONE.Container/e2e",
        "e2e": "/api/v4/systems/TEST.ONE.Container/e2e",
        "purpose": "/api/v4/systems/TEST.ONE.Container/purpose",
        "self": "/api/v4/systems/TEST.ONE.Container",
    }
}

export const APP_INTERFACE = {
    "name": "App with interface",
    "code": "TEST.INTERFACE",
    "version": "1.0",
    "author": "Игорь Воронин",
    "FQName": "IT-Landscape Catalog/DEV_TEST/Tests/ReadOnly",
    "status": "Proposed",
    "containers": [
        {
            "name": "App with interface backend",
            "code": "backend.TEST.INTERFACE",
            "version": "1.0",
            "description": "Тестовый контейнер",
            "status": "Proposed",
            "interfaces": [
                {
                    name: "Mordor API",
                    code: "mordor.backend.TEST.INTERFACE",
                    description: "Локтар огар",
                    version: "1.0",
                    status: "Proposed",
                    "methods": []
                }
            ]
        }
    ],
    "links": {
        "self": "/api/v4/systems/TEST.INTERFACE",
        "purpose": "/api/v4/systems/TEST.INTERFACE/purpose",
        "e2e": "/api/v4/systems/TEST.INTERFACE/e2e",
        "assessments": "/api/v4/systems/TEST.INTERFACE/e2e"
    }
}

export const APP_INTERFACE_IMPLEMENTS = {
    "name": "App with interface (tc)",
    "code": "TEST.INTERFACE.TC",
    "version": "1.0",
    "author": "Игорь Воронин",
    "FQName": "IT-Landscape Catalog/DEV_TEST/Tests/ReadOnly",
    "status": "Proposed",
    "containers": [
        {
            "name": "App with interface backend",
            "code": "backend.TEST.INTERFACE.TC",
            "version": "1.0",
            "status": "Proposed",
            "description": "Тестовый контейнер",
            "interfaces": [
                {
                    "name": "Mordor API",
                    "code": "mordor.backend.TEST.INTERFACE.TC",
                    "version": "1.0",
                    "implements": "FDMSHOWCASEAPP.001",
                    "description": "Локтар огар",
                    "status": "Proposed",
                    "methods": []
                }
            ]
        }
    ],
    "links": {
        "self": "/api/v4/systems/TEST.INTERFACE.TC",
        "purpose": "/api/v4/systems/TEST.INTERFACE.TC/purpose",
        "e2e": "/api/v4/systems/TEST.INTERFACE.TC/e2e",
        "assessments": "/api/v4/systems/TEST.INTERFACE.TC/e2e"
    }
}

export const APP_METHODS = {
    "name": "App with methods",
    "code": "TEST.METHODS",
    "version": "1.0",
    "author": "Игорь Воронин",
    "FQName": "IT-Landscape Catalog/DEV_TEST/Tests/ReadOnly",
    "status": "Proposed",
    "containers": [
        {
            "name": "App with interface backend",
            "code": "backend.TEST.METHODS",
            "version": "1.0",
            "status": "Proposed",
            "description": "Тестовый контейнер",
            "interfaces": [
                {
                    "name": "Mordor API",
                    "code": "mordor.backend.TEST.METHODS",
                    "version": "1.0",
                    "description": "Родился орком - защищай мордор!",
                    "status": "Proposed",
                    "implements": "FDMSHOWCASEAPP.001",
                    "methods": [
                        {
                            "name": "GET /orcs",
                            "description": "Получить информацию обо всех орках"
                        },
                        {
                            "name": "GET /orcs/{nick}",
                            "description": "Получить информации об орке по его прозвищу"
                        },
                        {
                            "name": "PUT /orcs/{nick}",
                            "description": "Обновить информацию об орке"
                        }
                    ]
                }
            ]
        }
    ],
    "links": {
        "assessments": "/api/v4/systems/TEST.METHODS/e2e",
        "e2e": "/api/v4/systems/TEST.METHODS/e2e",
        "purpose": "/api/v4/systems/TEST.METHODS/purpose",
        "self": "/api/v4/systems/TEST.METHODS",
    }
}