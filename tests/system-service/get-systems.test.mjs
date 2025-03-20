import { suite, test, before } from 'node:test';
import assert, { deepEqual, deepStrictEqual, strictEqual } from 'assert';


import { updateEnv } from '../env.mjs';
import { APP_API_TC, APP_API_TC_INTERFACE, APP_API_TC_PURPOSE, APP_API_TC_READ_INTERFACES, CDMB_A, checkSystem, checkSystemContainers, checkSystemMethods, CMDB_A_INTERFACE_SAMPLE, CMDB_A_METHODS_SAMPLE, SYSTEM_CODE, SYSTEM_INTERFACES_SAMPLE, SYSTEM_METHODS_SAMPLE, SYSTEM_NAME, SYSTEM_SAMPLE } from './const.mjs';
import System from '../../src/api/model/system.mjs';

import systemsService, { CONTAINERS_LEVEL, INTERFACES_LEVEL, METHODS_LEVEL } from '../../src/api/services/systems-service/index.mjs';
import { NotImplemented } from '../../src/utils/errors.mjs';


suite('Получение информаиции о системе (без контейнеров)', () => {
    before(async () => {
        updateEnv();
    })

    test("Получение систем без контейнеров", async () => {
        const systems = await systemsService.getAll();
        assert(systems.length)
        const s = systems.find(c => c.code === SYSTEM_CODE);
        checkSystem(s)
    });

    test("Получение системы без контейнеров по коду", async () => {
        const s = await systemsService.getByCode(SYSTEM_CODE);
        checkSystem(s);
    })

    test("Получение системы без контейнеров по коду (нижний регистр)", async (t) => {
        const fdm = await systemsService.getByCode(SYSTEM_CODE.toLowerCase());
        checkSystem(fdm);
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

    test("ВСе системы с контейнерами", async () => {
        const systems = await systemsService.getAll({ level: CONTAINERS_LEVEL });
        assert(systems.length)
        const s = systems.find(c => c.code === SYSTEM_CODE);
        checkSystemContainers(s);
    });

    test("Система с контейнерами по коду", async () => {
        const s = await systemsService.getByCode(SYSTEM_CODE, { level: CONTAINERS_LEVEL });
        checkSystemContainers(s);
    })

    test("Система с контейнерами по коду (нижний регистр)", async (t) => {
        const s = await systemsService.getByCode(SYSTEM_CODE.toLowerCase(), { level: CONTAINERS_LEVEL });
        checkSystemContainers(s);
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


/**
 * 
 * @param {System} s 
 */
const checkSystemInterfaces = (s) => {
    if (s.modifiedDate) s.modifiedDate = undefined;
    deepEqual(JSON.parse(JSON.stringify(s)), SYSTEM_INTERFACES_SAMPLE);
}

suite('Получение информаиции о системе с интерфейсами', () => {
    before(async () => {
        updateEnv();
    })

    test("ВСе системы с интерфейсами", async () => {
        const SAMPLE = APP_API_TC_READ_INTERFACES;
        const systems = await systemsService.getAll({ level: INTERFACES_LEVEL });
        assert(systems.length)
        const s = systems.find(c => c.code === SYSTEM_METHODS_SAMPLE.code);
        s.modifiedDate = undefined;
        deepEqual(JSON.parse(JSON.stringify(s)), SYSTEM_INTERFACES_SAMPLE, 'Система с интерфейсом и спецификацией');
        const tc = systems.find(c => c.code === SAMPLE.code);
        tc.modifiedDate = undefined;
        deepEqual(JSON.parse(JSON.stringify(tc)), SAMPLE, 'Система с интерфейсом (есть реализация ТС)');
    });

    test("Система с интерфейсами по коду", async () => {
        const s = await systemsService.getByCode(SYSTEM_CODE, { level: INTERFACES_LEVEL });
        checkSystemInterfaces(s);
    })

    test("Система с интерфейсами по коду (нижний регистр)", async (t) => {
        const s = await systemsService.getByCode(SYSTEM_CODE.toLowerCase(), { level: INTERFACES_LEVEL });
        checkSystemInterfaces(s);
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
        const s = systems.find(c => c.code === SYSTEM_CODE);
        checkSystemMethods(s);
    });

    test("Система с контейнерами по коду", async () => {
        const s = await systemsService.getByCode(SYSTEM_CODE, { level: METHODS_LEVEL });
        checkSystemMethods(s);
    })

    test("Система с контейнерами по коду (нижний регистр)", async (t) => {
        const s = await systemsService.getByCode(SYSTEM_CODE.toLowerCase(), { level: METHODS_LEVEL });
        checkSystemMethods(s);
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


suite("Позиционирование и участие в E2E", async () => {
    before(async () => {
        updateEnv();
    })

    test("Получение для тестовой системы", async () => {
        const purpose = await systemsService.getPurpose(APP_API_TC_READ_INTERFACES.code.toLowerCase());
        deepEqual( purpose, APP_API_TC_PURPOSE);
    });

    test("Участие в Е2Е", async () => {
        throw Error('Not implemented');
    });
});

suite("Результаты оценки приложения", async () => {
    before(async () => {
        updateEnv();
    })

    test("Получение для тестового приложения", async () => {
        throw Error('TODO')
    });

    test("Получение для тестового приложения (код в нижнем регистре)", async () => {
        throw Error('TODO')
    });
});