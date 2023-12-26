import capabilitiesController from "../controllers/capabilities-controller.mjs";
import CAPABILITY_EXAMPLES from "../swagger/examples/capability-examples.mjs";

const CAPABILITY_METHODS = {
    tag: "Управление возможностями",
    description: "Управление возможностями и доменами",
    paths: {
        "/api/capabilities": {
            get: {
                operation: capabilitiesController.getCapabilities,
                summary: "Получение списка возможностей",
                description: "Получение списка возможностей (домены и бизнес-возможности)",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                examples: {
                                    "OK": [
                                        CAPABILITY_EXAMPLES.RootDomain,
                                        CAPABILITY_EXAMPLES.DomainGroup,
                                        CAPABILITY_EXAMPLES.Capability,
                                        CAPABILITY_EXAMPLES.ChildCapability
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/capabilities/{code}": {
            get: {
                operation: capabilitiesController.getCapabilityByCode,
                summary: "Получение возможности по коду",
                description: "Получение описания возможности по коду (домены и бизнес-возможности)",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description: "Код запрашиваемой возможности",
                        examples: {
                            "Домен": {
                                "value": "GRP.010"
                            },
                            "Бизнес-возможсность": {
                                value: "BC-000134"
                            },
                            "Отсутстувующая возможность": {
                                "value": "WRONG"
                            }
                        },
                        "required": true
                    }
                ],
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                examples: {
                                    "Domain": CAPABILITY_EXAMPLES.RootDomain,
                                    "Group": CAPABILITY_EXAMPLES.DomainGroup,
                                    "Capability": CAPABILITY_EXAMPLES.Capability,
                                    "ChildCapability": CAPABILITY_EXAMPLES.ChildCapability
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/capabilities/{code}/children": {
            get: {
                operation: capabilitiesController.getCapabilityChildren,
                summary: "Получение дочерних возможностей",
                description: "Получение дочерних возможностей (домены и бизнес-возможности)",
                parameters: [
                    {
                        name: "code",
                        in: "path",
                        description : "Код возможности",
                        required: true,
                        examples: {
                            "BC-014055": {
                                value: "BC-014055"
                            }
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                examples: {
                                    "Домен с поддоменами": [CAPABILITY_EXAMPLES.ChildCapability]
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/capabilities-tree/": {
            get: {
                operation: capabilitiesController.getCapabilitiesTree,
                summary: "Получение иерархии возможностей",
                description: "Получение иерархии возможностей (домены и бизнес-возможности)",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                examples: {
                                    "Домен с поддоменами": CAPABILITY_EXAMPLES.DomainWithChildren
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}


export default CAPABILITY_METHODS;