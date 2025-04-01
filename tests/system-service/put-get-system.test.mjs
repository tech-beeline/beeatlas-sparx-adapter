import { before, suite, test } from 'node:test';
import assert, { deepEqual, deepStrictEqual } from "node:assert";


import { updateEnv } from '../env.mjs';

import { APP_API_TC, APP_API_TC_READ_INTERFACES, CDMB_A, checkSystem, checkSystemContainers, checkSystemMethods, CMDB_A_CONTAINER_SAMPLE, CMDB_A_METHODS_SAMPLE, CMDB_A_SAMPLE, SYSTEM_CODE, SYSTEM_CONTAINER_SAMPLE, SYSTEM_METHODS_SAMPLE, SYSTEM_SAMPLE } from './const.mjs';

import systemsService, { CONTAINERS_LEVEL, INTERFACES_LEVEL, METHODS_LEVEL, SystemService } from '../../src/api/services/systems-service/index.mjs';
import { SparxRepositoryPackagesOptions } from '../../src/api/repositories/sparx-ea-repository/options.mjs';
import { CREATE_ONE_CONTAINER } from './data/put-app.mjs';

suite("Обновление системы", () => {
    before(() => {
        updateEnv();
        SparxRepositoryPackagesOptions.init();
    });

    test('Публикация первого контейнера для системы', async () => {
        const service = new SystemService();

        const app = await service.getByCode(CREATE_ONE_CONTAINER.code, { level: CONTAINERS_LEVEL });
        assert(app.containers && app.containers.length === 0, "Приложение для проверки должно быть без контейнеров");

        const updated = await service.putSystem(CREATE_ONE_CONTAINER.code, CREATE_ONE_CONTAINER);
        const newVersion = JSON.parse(JSON.stringify(await service.getByCode(CREATE_ONE_CONTAINER.code, { level: CONTAINERS_LEVEL })));
        delete newVersion.modifiedDate;
        deepEqual(newVersion, CREATE_ONE_CONTAINER);

        await service.putSystem(CREATE_ONE_CONTAINER.code, app);
    });



    test("Установка и удаление кода ТС для интерфейса", async (t) => {
        const SAMPLE = APP_API_TC;
        await systemsService.putSystem(SAMPLE.code, SAMPLE);
        const app_api_tc = await systemsService.getByCode(SAMPLE.code, { level: "methods" });
        assert(app_api_tc);
        app_api_tc.modifiedDate = undefined;
        deepEqual(JSON.parse(JSON.stringify(app_api_tc)), SAMPLE);
    });

    test("Система с containers==null или undefinded", async (t) => {
        //throw Error('TODO');
    });

    test("Система с interfaces==null или undefinded", async (t) => {
        //throw Error('TODO');
    });

    test("Слияние дублей методов", async (t) => {
        //throw Error('TODO');
    });
});