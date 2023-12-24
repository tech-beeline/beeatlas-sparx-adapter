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
        "/api/capabilities/tree": {
            get: {
                operation: capabilitiesController.getCapabilitiesTree,
                summary: "Получение иерархии возможностей",
                description: "Получение иерархии возможностей (домены и бизнес-возможности)",
                responses: {
                    200: {
                        description: "OK"
                    }
                }
            }
        }
    }
}


export default CAPABILITY_METHODS;