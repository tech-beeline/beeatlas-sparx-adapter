import { deepEqual, deepStrictEqual } from "node:assert";
import System from "../../src/api/model/system.mjs";

export const SYSTEM_CODE = 'SYSTEM_CODE';
export const CDMB_A = "CMDB_A";

export const SYSTEM_NAME = 'The System';

export const SYSTEM_CONTAINER_SAMPLE = {
    "name": "The System",
    "code": "SYSTEM_CODE",
    "version": "1.0",
    "author": "Игорь Воронин",
    "FQName": "IT-Landscape Catalog/DEV_TEST/The System",
    "status": "Proposed",
    "containers": [
        {
            "name": "Backend service",
            "code": "BACKEND.SYSTEM_CODE",
            "version": "1.0.0",
            "description": "Подробное описание",
            "status": "Proposed"
        }
    ],
    "links": {
        "self": "/api/v4/systems/SYSTEM_CODE",
        "purpose": "/api/v4/systems/SYSTEM_CODE/purpose",
        "e2e": "/api/v4/systems/SYSTEM_CODE/e2e",
        "assessments": "/api/v4/systems/SYSTEM_CODE/e2e"
    }
};

export const SYSTEM_SAMPLE = {
    name: "The System",
    code: "SYSTEM_CODE",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/The System",
    status: "Proposed",
    containers: [
    ],
    links: {
        self: "/api/v4/systems/SYSTEM_CODE",
        purpose: "/api/v4/systems/SYSTEM_CODE/purpose",
        e2e: "/api/v4/systems/SYSTEM_CODE/e2e",
        assessments: "/api/v4/systems/SYSTEM_CODE/e2e",
    }
};

export const SYSTEM_INTERFACES_SAMPLE = {
    name: "The System",
    code: "SYSTEM_CODE",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/The System",
    status: "Proposed",
    containers: [
        {
            name: "Backend service",
            code: "BACKEND.SYSTEM_CODE",
            version: "1.0.0",
            description: "Подробное описание",
            status: "Proposed",
            interfaces: [
                {
                    name: "API поиска чего-нибудь",
                    code: "SEARCH-API.BACKEND.SYSTEM_CODE",
                    version: "1.0.0",
                    description: "Подробно о",
                    status: "Proposed",
                    methods: [
                    ],
                },
            ],
        },
    ],
    links: {
        self: "/api/v4/systems/SYSTEM_CODE",
        purpose: "/api/v4/systems/SYSTEM_CODE/purpose",
        e2e: "/api/v4/systems/SYSTEM_CODE/e2e",
        assessments: "/api/v4/systems/SYSTEM_CODE/e2e",
    },
};


export const SYSTEM_METHODS_SAMPLE = {
    name: "The System",
    code: "SYSTEM_CODE",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/The System",
    status: "Proposed",
    containers: [
        {
            name: "Backend service",
            code: "BACKEND.SYSTEM_CODE",
            version: "1.0.0",
            description: "Подробное описание",
            status: "Proposed",
            interfaces: [
                {
                    name: "API поиска чего-нибудь",
                    code: "SEARCH-API.BACKEND.SYSTEM_CODE",
                    version: "1.0.0",
                    description: "Подробно о",
                    status: "Proposed",
                    methods: [
                        {
                            "error_rate": "1",
                            "latency": "500",
                            "name": "GET /api/entities",
                            "parameters": [],
                            "tags": {},
                            "rps": "10"
                        },
                        {
                            "name": "POST /api/entities",
                            "parameters": [],
                            "tags": {},
                        },
                    ],
                },
            ],
        },
    ],
    links: {
        self: "/api/v4/systems/SYSTEM_CODE",
        purpose: "/api/v4/systems/SYSTEM_CODE/purpose",
        e2e: "/api/v4/systems/SYSTEM_CODE/e2e",
        assessments: "/api/v4/systems/SYSTEM_CODE/e2e",
    },
};

export const CMDB_A_SAMPLE = {
    name: "System A",
    code: "CMDB_A",
    version: "1.0",
    author: "Igor Voronin",
    FQName: "IT-Landscape Catalog/DEV_TEST/Test Application",
    status: "Proposed",
    containers: [
    ],
    links: {
        self: "/api/v4/systems/CMDB_A",
        purpose: "/api/v4/systems/CMDB_A/purpose",
        e2e: "/api/v4/systems/CMDB_A/e2e",
        assessments: "/api/v4/systems/CMDB_A/e2e",
    },
};



export const CMDB_A_CONTAINER_SAMPLE = {
    name: "System A",
    code: "CMDB_A",
    version: "1.0",
    author: "Igor Voronin",
    FQName: "IT-Landscape Catalog/DEV_TEST/Test Application",
    status: "Proposed",
    containers: [
        {
            name: "Backend service",
            code: "BACKEND.CMDB_A",
            version: "1.0.0",
            description: "Подробное описание",
            status: "Proposed",
        }
    ],
    links: {
        self: "/api/v4/systems/CMDB_A",
        purpose: "/api/v4/systems/CMDB_A/purpose",
        e2e: "/api/v4/systems/CMDB_A/e2e",
        assessments: "/api/v4/systems/CMDB_A/e2e",
    },
};


export const CMDB_A_INTERFACE_SAMPLE = {
    name: "System A",
    code: "CMDB_A",
    version: "1.0",
    author: "Igor Voronin",
    FQName: "IT-Landscape Catalog/DEV_TEST/Test Application",
    status: "Proposed",
    containers: [
        {
            name: "Backend service",
            code: "BACKEND.CMDB_A",
            version: "1.0.0",
            description: "Подробное описание",
            status: "Proposed",
            interfaces: [
                {
                    name: "API поиска чего-нибудь",
                    code: "SEARCH-API.BACKEND.CMDB_A",
                    version: "1.0.0",
                    description: "Подробно о",
                    status: "Proposed",
                    specification: "/swagger/searcj.json",
                    methods: []
                }
            ]
        }
    ],
    links: {
        self: "/api/v4/systems/CMDB_A",
        purpose: "/api/v4/systems/CMDB_A/purpose",
        e2e: "/api/v4/systems/CMDB_A/e2e",
        assessments: "/api/v4/systems/CMDB_A/e2e",
    },
};


export const CMDB_A_METHODS_SAMPLE = {
    name: "System A",
    code: "CMDB_A",
    version: "1.0",
    author: "Igor Voronin",
    FQName: "IT-Landscape Catalog/DEV_TEST/Test Application",
    status: "Proposed",
    containers: [
        {
            name: "Backend service",
            code: "BACKEND.CMDB_A",
            version: "1.0.0",
            description: "Подробное описание",
            status: "Proposed",
            interfaces: [
                {
                    name: "API поиска чего-нибудь",
                    code: "SEARCH-API.BACKEND.CMDB_A",
                    version: "1.0.0",
                    description: "Подробно о",
                    status: "Proposed",
                    specification: "/swagger/searcj.json",
                    methods: [
                        {
                            error_rate: "1",
                            latency: "500",
                            rps: "10",
                            name: "GET /api/entities",
                            parameters: [],
                            tags: {},
                        },
                        {
                            "name": "POST /api/entities",
                            "parameters": [],
                            "tags": {},
                        },
                    ],
                },
            ],
        },
    ],
    links: {
        assessments: "/api/v4/systems/CMDB_A/e2e",
        e2e: "/api/v4/systems/CMDB_A/e2e",
        purpose: "/api/v4/systems/CMDB_A/purpose",
        self: "/api/v4/systems/CMDB_A",
    },
};

export const APP_API_TC_INTERFACE = {
    name: "App_Api_Tc",
    code: "TEST.APP.API.TC",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/AppInterfaceCapability",
    status: "Proposed",
    containers: [
        {
            name: "Backend service",
            code: "BACKEND.TEST.APP.API.TC",
            version: "1.0.0",
            description: "Контейнер для тестирования загрузки API с ТС",
            status: "Proposed",
            interfaces: [
                {
                    name: "API поиска чего-нибудь",
                    code: "SEARCH-API.BACKEND.TEST.APP.API.TC",
                    version: "1.0.0",
                    description: "Подробно о",
                    status: "Proposed",
                    implements: "FDMSHOWCASEAPP.001",
                    methods: [
                    ]
                }
            ]
        }
    ],
    links: {
        self: "/api/v4/systems/TEST.APP.API.TC",
        purpose: "/api/v4/systems/TEST.APP.API.TC/purpose",
        e2e: "/api/v4/systems/TEST.APP.API.TC/e2e",
        assessments: "/api/v4/systems/TEST.APP.API.TC/e2e"
    }
}

export const APP_API_TC = {
    name: "App_Api_Tc",
    code: "TEST.APP.API.TC",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/AppInterfaceCapability",
    status: "Proposed",
    containers: [
        {
            name: "Backend service",
            code: "BACKEND.TEST.APP.API.TC",
            version: "1.0.0",
            description: "Контейнер для тестирования загрузки API с ТС",
            status: "Proposed",
            interfaces: [
                {
                    name: "API поиска чего-нибудь",
                    code: "SEARCH-API.BACKEND.TEST.APP.API.TC",
                    version: "1.0.0",
                    description: "Подробно о",
                    status: "Proposed",
                    implements: "FDMSHOWCASEAPP.001",
                    methods: [
                        {
                            "error_rate": "1",
                            "latency": "500",
                            "name": "GET /api/entities",
                            "parameters": [],
                            "tags": {}
                        }
                    ]
                }
            ]
        }
    ],
    links: {
        self: "/api/v4/systems/TEST.APP.API.TC",
        purpose: "/api/v4/systems/TEST.APP.API.TC/purpose",
        e2e: "/api/v4/systems/TEST.APP.API.TC/e2e",
        assessments: "/api/v4/systems/TEST.APP.API.TC/e2e"
    }
}

export const APP_API_TC_READ_INTERFACES = {
    name: "App_Api_Tc_read",
    code: "TEST.APP.API.TC.READ",
    version: "1.0",
    author: "Игорь Воронин",
    FQName: "IT-Landscape Catalog/DEV_TEST/AppInterfaceCapability",
    status: "Proposed",
    containers: [
        {
            name: "Backend service",
            code: "BACKEND.TEST.APP.API.TC.READ",
            version: "1.0.0",
            description: "Контейнер для тестирования загрузки API с ТС",
            status: "Proposed",
            interfaces: [
                {
                    name: "API поиска чего-нибудь",
                    code: "SEARCH-API.BACKEND.TEST.APP.API.TC.READ",
                    version: "1.0.0",
                    description: "Подробно о",
                    status: "Proposed",
                    implements: "FDMSHOWCASEAPP.001",
                    methods: [
                    ]
                }
            ]
        }
    ],
    links: {
        self: "/api/v4/systems/TEST.APP.API.TC.READ",
        purpose: "/api/v4/systems/TEST.APP.API.TC.READ/purpose",
        e2e: "/api/v4/systems/TEST.APP.API.TC.READ/e2e",
        assessments: "/api/v4/systems/TEST.APP.API.TC.READ/e2e"
    }
}

export const APP_API_TC_PURPOSE = {
    children: [
        {
            children: [
                {
                    children: [
                        {
                            children: [
                                {
                                    name: "Name",
                                    code: "TEST.APP.API.TC.READ.001",
                                    type: "TechnicalCapability",
                                    href: "/api/v4/tc/TEST.APP.API.TC.READ.001",
                                },
                            ],
                            name: "Проектирование технического решения ИТ-продукта",
                            code: "DMN.153",
                            type: "Domain",
                            href: "/api/v4/capabilities/DMN.153",
                        },
                    ],
                    name: "Сервисы производства",
                    code: "GRP.012",
                    type: "Domain",
                    href: "/api/v4/capabilities/GRP.012",
                },
            ],
            name: "Сервисы ИТ-ландшафта ВК",
            code: "GRP.011",
            type: "Domain",
            href: "/api/v4/capabilities/GRP.011",
        },
    ],
    name: "Каталог Возможностей (Capability Catalog)",
    code: "GRP.000",
    type: "Domain",
    href: "/api/v4/capabilities/GRP.000",
}

export const checkSystemMethods = (s, a = SYSTEM_METHODS_SAMPLE) => {
    if (s.modifiedDate) s.modifiedDate = undefined;
    deepEqual(JSON.parse(JSON.stringify(s)), a);
}

/**
 * 
 * @param {System} s 
 */
export const checkSystemContainers = (s, a = SYSTEM_CONTAINER_SAMPLE) => {
    if (s.modifiedDate) s.modifiedDate = undefined;
    deepEqual(JSON.parse(JSON.stringify(s)), a);
}

export function checkSystem(s, a = SYSTEM_SAMPLE) {
    if (s) {
        s.modifiedDate = undefined;
    }
    deepStrictEqual(JSON.parse(JSON.stringify(s)), a);
}