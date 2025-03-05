import { suite, test } from 'node:test';
import assert, { strictEqual } from 'assert';


import { readEnv } from '../env.mjs';
import { SYSTEM_CODE, SYSTEM_NAME } from './const.mjs';
import { CONTAINERS_LEVEL } from '../../src/api/services/systems-service/const.mjs';
import System from '../../src/api/model/system.mjs';

readEnv();

import systemsService from '../../src/api/services/systems-service/index.mjs';

const checkSystem = s => {
    assert(s);
    assert(s.code === SYSTEM_CODE);
    assert(s.name === SYSTEM_NAME)
}

suite('Получение информаиции о системе (без контейнеров)', () => {
    test("get all systems", async () => {
        const systems = await systemsService.getAll();
        assert(systems.length)
        const s = systems.find(c => c.code === SYSTEM_CODE);
        checkSystem(s);
    });

    test("get system by code", async () => {
        const s = await systemsService.getByCode(SYSTEM_CODE);
        checkSystem(s);
    })

    test("get system by lower code", async (t) => {
        const fdm = await systemsService.getByCode(SYSTEM_CODE.toLowerCase());
        checkSystem(fdm);
    })

    test("get system with wrong code", async (t) => {
        try {
            const fdm = await systemsService.getByCode('-');
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
const checkSystemContainers = (s) => {
    assert(s.containers);
}

suite('Получение информаиции о системес контейнерами', () => {
    test("get all systems", async () => {
        const systems = await systemsService.getAll({ level: CONTAINERS_LEVEL });
        assert(systems.length)
        const s = systems.find(c => c.code === SYSTEM_CODE);
        checkSystemContainers(s);
    });

    test("get system by code", async () => {
        const s = await systemsService.getByCode(SYSTEM_CODE);
        checkSystem(s);
    })

    test("get system by lower code", async (t) => {
        const fdm = await systemsService.getByCode(SYSTEM_CODE.toLowerCase());
        checkSystem(fdm);
    })

    test("get system with wrong code", async (t) => {
        try {
            const fdm = await systemsService.getByCode('-');
        } catch (error) {
            return;
        }
        throw Error('not exception')
    })

});

