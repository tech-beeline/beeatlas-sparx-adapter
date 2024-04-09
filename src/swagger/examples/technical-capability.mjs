import TechnicalCapability
    from "../../model/technical-capability.mjs";
const TC_SAMPLES = {
    POST_SMAPLE: new TechnicalCapability({
        name: 'Тестовая ТС', targetSystemCode: 'FDMSHOWCASEAPP', description: 'Это описание тестовой ТС',
        parents: ['BC-000137', 'BC-000135']
    })
}
export default TC_SAMPLES;