import componentsController from "../controllers/components-controller.mjs";
import COMPONENTS_EXAMPLES from "../swagger/examples/components-examples.mjs";


const COMPONENTS_METHODS = {
    tag: "Управление компонентами",
    description: "Управление компонентами",
    paths: {
        "/api/components": {
            get: {
                operation: componentsController.getComponents,
                summary: "Получение списка компонентов",
                description: "Получение списка компонентов",
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                examples: {
                                    "OK": [
                                        COMPONENTS_EXAMPLES.SimpleComponent,
                                        COMPONENTS_EXAMPLES.BACKENDISHOP]
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export default COMPONENTS_METHODS;