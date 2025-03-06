import { suite, test } from 'node:test';
import assert, { deepEqual, deepStrictEqual, strictEqual } from 'assert';


import { readEnv } from '../env.mjs';
import { checkSystem, checkSystemContainers, checkSystemMethods, SYSTEM_CODE, SYSTEM_INTERFACES_SAMPLE, SYSTEM_METHODS_SAMPLE, SYSTEM_NAME, SYSTEM_SAMPLE } from './const.mjs';
import System from '../../src/api/model/system.mjs';

readEnv();

import systemsService, { CONTAINERS_LEVEL, INTERFACES_LEVEL, METHODS_LEVEL } from '../../src/api/services/systems-service/index.mjs';


suite('Получение информаиции о системе (без контейнеров)', () => {
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
    test("ВСе системы с интерфейсами", async () => {
        const systems = await systemsService.getAll({ level: INTERFACES_LEVEL });
        assert(systems.length)
        const s = systems.find(c => c.code === SYSTEM_CODE);
        checkSystemInterfaces(s);
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