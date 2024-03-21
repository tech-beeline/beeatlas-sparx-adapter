import System, { Container, APIInterface, APIMethod } from "../../model/system.mjs";


const SIMPLE_SYSTEM = new System({
    name: "System A", code: "CMDB_A", version: '1.0',
    author: "FDM API", description: "this is description", "ea_guid": '{7B14A5CA-0614-4509-9EE7-9D4442774560}', fullName: 'IT-Landscape Catalog/DEV_TEST/Test Application/System A', package: 'Test Application',
    containers: [
        new Container({
            name: "Контейнер Системы А", code: 'CONTAINER.CMDB_A', version: '1.0', interfaces: [
                new APIInterface({
                    name: "IMyRestAPI", code: "IMYAPI.CONTAINER.CMDB_A", version: '1.0', capabilityCode: 'BC-ХХХХХ',
                    api_url: "https://dashboard-dev-eafdmmart.apps.yd-m6-kt22.vimpelcom.ru/swagger/capabilities-api.json", methods: [
                        new APIMethod({ name: 'GET /api/v1/systems/{code}', description: 'ПОлучение системы по коду', returnType: 'System', parameters: [{ name: 'code', type: 'string' }] })
                    ]
                })
            ]
        })]
})
const OTHER_SIMPLE_SAMPLE = new System({
    name: "System B", code: "CMDB_B", version: '1.0',
    description: "this is description",
    containers: [
        new Container({
            name: "Контейнер Системы А", code: 'CONTAINER.CMDB_B', version: '1.0', interfaces: [
                new APIInterface({
                    name: "IMyRestAPI", code: "IMYAPI.CONTAINER.CMDB_B", version: '1.0', capabilityCode: 'BC-ХХХХХ',
                    api_url: "https://dashboard-dev-eafdmmart.apps.yd-m6-kt22.vimpelcom.ru/swagger/capabilities-api.json", methods: [
                        new APIMethod({ name: 'GET /api/v1/systems/{code}', description: 'ПОлучение системы по коду', returnType: 'System', parameters: [{ name: 'code', type: 'string' }] })
                    ]
                })
            ]
        })]
})
const LIST_SAMPLE = [
    SIMPLE_SYSTEM, OTHER_SIMPLE_SAMPLE
]


export default { SIMPLE_SYSTEM, OTHER_SIMPLE_SAMPLE, LIST_SAMPLE };