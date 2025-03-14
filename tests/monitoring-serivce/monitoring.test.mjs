import { suite, test, before } from 'node:test';
import assert, { deepEqual, deepStrictEqual, strictEqual } from 'assert';


import { updateEnv } from '../env.mjs';
import { MonitiringSourcesServices, SystemService } from '../../src/api/services/index.mjs';

const PROMETHEUS_TEMPLATE = "https://inside.beeline.ru/d/56_72PcHk/prometheus-template-api-queries?orgId=1";
const OPENSEARCH_TEMPLATE = "https://inside.beeline.ru/d/hwzG1EcNz/opensearch-template-api-queries?orgId=1";

suite("Установка шаблонов мониторинга API", async () => {
    before(async () => {
        updateEnv();
    })

    const service = new MonitiringSourcesServices();
    const systemService = new SystemService();

    test("Установка шаблона для приложения", async () => {
        let ret = await systemService.setAppMonitoringTemplate("fdmshowcaseapp", PROMETHEUS_TEMPLATE);
        assert(ret.apiMetricTemplate == PROMETHEUS_TEMPLATE, 'Не установлен шаблон прометея');
        ret = await systemService.setAppMonitoringTemplate("fdmshowcaseapp", null);
        assert(!ret.apiMetricTemplate, 'Шаблон не удалился');
        ret = await systemService.setAppMonitoringTemplate("fdmshowcaseapp", OPENSEARCH_TEMPLATE);
        assert(ret.apiMetricTemplate == OPENSEARCH_TEMPLATE, 'Шаблон opensearch не установился');
    })



    test("Установка шаблона для контетйнера", async () => {
        const ret = await service.setContainerMetricTemplate({
            containerCode: "dashboard.fdmshowcaseapp",
            apiMetricTemplate: "https://inside.beeline.ru/d/56_72PcHk/prometheus-template-api-queries?orgId=1"
        });
    })
})