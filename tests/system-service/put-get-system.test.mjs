import { before, suite, test } from 'node:test';
import assert, { deepEqual, deepStrictEqual } from "node:assert";


import { updateEnv } from '../env.mjs';

import { APP_API_TC, APP_API_TC_READ_INTERFACES, CDMB_A, checkSystem, checkSystemContainers, checkSystemMethods, CMDB_A_CONTAINER_SAMPLE, CMDB_A_METHODS_SAMPLE, CMDB_A_SAMPLE, SYSTEM_CODE, SYSTEM_CONTAINER_SAMPLE, SYSTEM_METHODS_SAMPLE, SYSTEM_SAMPLE } from './const.mjs';

import systemsService, { CONTAINERS_LEVEL, INTERFACES_LEVEL, METHODS_LEVEL } from '../../src/api/services/systems-service/index.mjs';
import { SparxRepositoryPackagesOptions } from '../../src/api/repositories/sparx-ea-repository/options.mjs';

suite("Обновление системы", () => {
    before(() => {
        updateEnv();
        SparxRepositoryPackagesOptions.init();
    });

    test("пустая система, потом сиcтема с контейнерами", async (t) => {
        await systemsService.putSystem(CDMB_A, CMDB_A_SAMPLE);
        const s1 = await systemsService.getByCode(CDMB_A.toLowerCase(), { level: METHODS_LEVEL });
        checkSystem(s1, CMDB_A_SAMPLE);

        await systemsService.putSystem(CDMB_A.toLowerCase(), CMDB_A_CONTAINER_SAMPLE);
        checkSystemContainers(await systemsService.getByCode(CDMB_A.toLowerCase(), { level: METHODS_LEVEL }), CMDB_A_CONTAINER_SAMPLE);
        checkSystemContainers(await systemsService.getByCode(CDMB_A, { level: METHODS_LEVEL }), CMDB_A_CONTAINER_SAMPLE);

        await systemsService.putSystem(CDMB_A, CMDB_A_METHODS_SAMPLE);
        checkSystemMethods(await systemsService.getByCode(CDMB_A.toLowerCase(), { level: METHODS_LEVEL }), CMDB_A_METHODS_SAMPLE);
        checkSystemMethods(await systemsService.getByCode(CDMB_A, { level: METHODS_LEVEL }), CMDB_A_METHODS_SAMPLE);
    });

    test("Установка и удаление кода ТС для интерфейса", async (t) => {
        const SAMPLE = APP_API_TC;
        await systemsService.putSystem(SAMPLE.code, SAMPLE);
        const app_api_tc = await systemsService.getByCode(SAMPLE.code, { level: "methods" });
        assert(app_api_tc);
        app_api_tc.modifiedDate = undefined;
        deepEqual(JSON.parse(JSON.stringify(app_api_tc)), SAMPLE);
    });
});