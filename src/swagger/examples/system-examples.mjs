import System, { Container, APIInterface, APIMethod } from "../../model/system.mjs";

const SYSTEM_EXAMPLES = {
    SIMPLE_SYSTEM: new System({
        name: "System A", code: "CMDB_A", version: '1.0', containers: [
            new Container({
                name: "Контейнер Системы А", code: 'CONTAINER.CMDB_A', version: '1.0', interfaces: [
                    new APIInterface({
                        name: "IMyRestAPI", code: "IMYAPI.CONTAINER.CMDB_A", version: '1.0', capabilityCode: 'BC-ХХХХХ', methods: [
                            new APIMethod({ name: 'GET /api/v1/systems/{code}', description: 'ПОлучение системы по коду', returnType: 'System', parameters: [{ name: 'code', type: 'string' }] })
                        ]
                    })
                ]
            })]
    })
}

export default SYSTEM_EXAMPLES;