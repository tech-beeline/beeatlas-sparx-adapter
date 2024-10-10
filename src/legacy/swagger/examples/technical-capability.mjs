import TechnicalCapability
    from "../../model/technical-capability-model-legacy.mjs";
const TC_SAMPLES = {
    POST_SAMPLE: new TechnicalCapability({
        name: 'Тестовая ТС', targetSystemCode: 'FDMSHOWCASEAPP', description: 'Это описание тестовой ТС',
        parents: ['BC-000137', 'BC-000135'], code: "TC-SAMPLE-CODE", version : '0.1', goal_from: "24Q3", goal_to: "25Q4"
    })
}
export default TC_SAMPLES;