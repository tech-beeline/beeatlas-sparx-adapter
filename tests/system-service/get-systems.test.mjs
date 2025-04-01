import { suite, test, before } from 'node:test';
import assert, { deepEqual, deepStrictEqual, strictEqual } from 'assert';


import { updateEnv } from '../env.mjs';
import { APP_API_TC, APP_API_TC_INTERFACE, APP_API_TC_PURPOSE, APP_API_TC_READ_INTERFACES, CDMB_A, checkSystem, checkSystemContainers, checkSystemMethods, CMDB_A_INTERFACE_SAMPLE, CMDB_A_METHODS_SAMPLE, SYSTEM_CODE, SYSTEM_INTERFACES_SAMPLE, SYSTEM_METHODS_SAMPLE, SYSTEM_NAME, SYSTEM_SAMPLE } from './const.mjs';

import systemsService, { CONTAINERS_LEVEL, INTERFACES_LEVEL, METHODS_LEVEL } from '../../src/api/services/systems-service/index.mjs';
import { NotImplemented } from '../../src/utils/errors.mjs';
import { APP_ALONE, APP_INTERFACE, APP_INTERFACE_IMPLEMENTS, APP_METHODS, APP_ONE_CONTAINER } from './data/get-app.mjs';


suite('Получение информаиции о системе (без контейнеров)', () => {
    before(async () => {
        updateEnv();
    })

    test("Получение систем без контейнеров", async () => {
        const systems = await systemsService.getAll();
        assert(systems.length)
        const s = JSON.parse(JSON.stringify(systems.find(c => c.code === APP_ALONE.code)));
        delete s.modifiedDate;
        deepEqual(s, APP_ALONE);
    });

    test("Получение системы без контейнеров по коду", async () => {
        const s = JSON.parse(JSON.stringify(await systemsService.getByCode(APP_ALONE.code)));
        delete s.modifiedDate;
        deepEqual(s, APP_ALONE);
    })

    test("Получение системы без контейнеров по коду (нижний регистр)", async (t) => {
        const s = JSON.parse(JSON.stringify(await systemsService.getByCode(APP_ALONE.code.toLowerCase())));
        delete s.modifiedDate;
        deepEqual(s, APP_ALONE);
    })

    test("Получение системы без контейнеров по коду (не праваильный код)", async (t) => {
        try {
            const fdm = await systemsService.getByCode('-');
        } catch (error) {
            return;
        }
        throw Error('not exception')
    })
});


suite('Получение информаиции о системах с контейнерами', () => {
    before(async () => {
        updateEnv();
    })

    test("Все системы с контейнерами", async () => {
        const SAMPLE = APP_ONE_CONTAINER;
        const systems = await systemsService.getAll({ level: CONTAINERS_LEVEL });
        assert(systems.length)
        const s = systems.find(c => c.code === APP_ONE_CONTAINER.code);
        s.modifiedDate = undefined;
        deepEqual(JSON.parse(JSON.stringify(s)), APP_ONE_CONTAINER);
    });

    test("Система с контейнерами по коду", async () => {
        const s = JSON.parse(JSON.stringify(await systemsService.getByCode(APP_ONE_CONTAINER.code, { level: CONTAINERS_LEVEL })));
        delete s.modifiedDate;
        deepEqual(s, APP_ONE_CONTAINER);
    })

    test("Система с контейнерами по коду (нижний регистр)", async (t) => {
        const s = JSON.parse(JSON.stringify(await systemsService.getByCode(APP_ONE_CONTAINER.code.toLowerCase(), { level: CONTAINERS_LEVEL })));
        delete s.modifiedDate;
        deepEqual(s, APP_ONE_CONTAINER);
    })

    test("Система с контейнерами по коду (не правильный код)", async (t) => {
        try {
            const fdm = await systemsService.getByCode('-', { level: CONTAINERS_LEVEL });
        } catch (error) {
            return;
        }
        throw Error('not exception')
    })
});


suite('Получение информаиции о системе с интерфейсами', () => {
    before(async () => {
        updateEnv();
    })

    test("ВСе системы с интерфейсами", async () => {
        const SAMPLE = APP_ONE_CONTAINER;
        const systems = await systemsService.getAll({ level: INTERFACES_LEVEL });
        assert(systems.length)
        const s = systems.find(c => c.code === APP_ONE_CONTAINER.code);
        s.modifiedDate = undefined;
        deepEqual(JSON.parse(JSON.stringify(s)), APP_ONE_CONTAINER, 'Система с интерфейсом и спецификацией');
    });

    test("Система с интерфейсами по коду", async () => {
        const s = JSON.parse(JSON.stringify(await systemsService.getByCode(APP_INTERFACE.code, { level: INTERFACES_LEVEL })));
        delete s.modifiedDate;
        deepEqual(s, APP_INTERFACE)
    })

    test("Система с интерфейсами по коду (нижний регистр)", async (t) => {
        const s = JSON.parse(JSON.stringify(await systemsService.getByCode(APP_INTERFACE.code.toLowerCase(), { level: INTERFACES_LEVEL })));
        delete s.modifiedDate;
        deepEqual(s, APP_INTERFACE)
    })

    test("Система с интерфейсами по коду (с установленной ТС, нижний регистр)", async (t) => {
        const s = JSON.parse(JSON.stringify(await systemsService.getByCode(APP_INTERFACE_IMPLEMENTS.code.toLowerCase(), { level: INTERFACES_LEVEL })));
        delete s.modifiedDate;
        deepEqual(s, APP_INTERFACE_IMPLEMENTS)
    })

    test("Система с интерфейсами по коду (не правильный код)", async (t) => {
        try {
            const fdm = await systemsService.getByCode('-', { level: INTERFACES_LEVEL });
        } catch (error) {
            return;
        }
        throw Error('not exception')
    })
});

suite('Получение информаиции о системе с методами', () => {
    before(async () => {
        updateEnv();
    })

    test("ВСе системы с методами", async () => {
        const systems = await systemsService.getAll({ level: METHODS_LEVEL });
        assert(systems.length)
        const s = JSON.parse(JSON.stringify(systems.find(c => c.code === APP_METHODS.code)))
        delete s.modifiedDate;
        deepEqual(s, APP_METHODS);
    });

    test("Система с контейнерами по коду", async () => {
        const s = JSON.parse(JSON.stringify(await systemsService.getByCode(APP_METHODS.code, { level: METHODS_LEVEL })));
        delete s.modifiedDate;
        deepEqual(s, APP_METHODS);
    })

    test("Система с контейнерами по коду (нижний регистр)", async (t) => {
        const s = JSON.parse(JSON.stringify(await systemsService.getByCode(APP_METHODS.code.toLowerCase(), { level: METHODS_LEVEL })));
        delete s.modifiedDate;
        deepEqual(s, APP_METHODS);
    })

    test("Система с контейнерами по коду (не правильный код)", async (t) => {
        try {
            const fdm = await systemsService.getByCode('-', { level: METHODS_LEVEL });
        } catch (error) {
            return;
        }
        throw Error('not exception')
    })
});

