import interfaceAggreementController from "../controllers/interface-aggreement-controller.mjs";

const INTERFACES_AGREEMENT_ROUTES = {
    tag: "Управение интерфейсными соглашениями",
    description: "Управление описанием интерфейсных соглашений",
    paths: {
        "/api/v1/interface-agreements/{ia_path}": {
            get: {
                operation: interfaceAggreementController.getInterfaceAgreement,
                summary: "Получение Описания интерфейса по коду",
                description: "",
                parameters: [
                    {
                        name: "ia_path",
                        in: "path",
                        description: "Путь к IA в репозитории",
                        "required": true,
                        examples: {
                            'RICH->napi': {
                                value: 'https://example.com'
                            }
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "text/plain": {
                            }
                        }
                    }
                }
            }
        }
    }
}

export default INTERFACES_AGREEMENT_ROUTES;