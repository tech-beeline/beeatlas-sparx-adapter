import { before, suite, test } from 'node:test';
import assert, { deepEqual, deepStrictEqual } from "node:assert";


import { updateEnv } from '../env.mjs';

import { APP_API_TC, APP_API_TC_READ_INTERFACES, CDMB_A, checkSystem, checkSystemContainers, checkSystemMethods, CMDB_A_CONTAINER_SAMPLE, CMDB_A_METHODS_SAMPLE, CMDB_A_SAMPLE, SYSTEM_CODE, SYSTEM_CONTAINER_SAMPLE, SYSTEM_METHODS_SAMPLE, SYSTEM_SAMPLE } from './const.mjs';

import systemsService, { CONTAINERS_LEVEL, INTERFACES_LEVEL, METHODS_LEVEL, SystemService } from '../../src/api/services/systems-service/index.mjs';
import { SparxRepositoryPackagesOptions } from '../../src/api/repositories/sparx-ea-repository/options.mjs';
import { ADD_INTERFACE_METHOD, CHANGE_CONTAINER_CODE, CONTAINER_EMPTY_CODE, CONTAINER_NULL_CODE, CONTAINER_WITHOUT_CODE, CREATE_CONTAINER_INTERFACE, CREATE_ONE_CONTAINER, CREATE_SLA, CREATE_TWO_CONTAINERS, INTERFACE_EMPTY_CODE, INTERFACE_NULL_CODE, INTERFACE_WITHOUT_CODE, NEW_CONTAINER, REMOVE_DOUBLES } from './data/put-app.mjs';
import { insertMethods } from './data/prepare-doubles.mjs';
import fdmStorage from '../../src/api/repositories/fdm-storage.mjs';

suite("Публикация для пустой системы", async () => {
    before(async () => {
        updateEnv();
        SparxRepositoryPackagesOptions.init();
    });

    test('Публикация первого контейнера для системы', async () => {

        const service = new SystemService();

        const app = await service.getByCode(CREATE_ONE_CONTAINER.code, { level: CONTAINERS_LEVEL });

        try {
            assert(app.containers && app.containers.length === 0, "Приложение для проверки должно быть без контейнеров");
            const updated = await service.putSystem(CREATE_ONE_CONTAINER.code, CREATE_ONE_CONTAINER);
            const newVersion = JSON.parse(JSON.stringify(await service.getByCode(CREATE_ONE_CONTAINER.code, { level: CONTAINERS_LEVEL })));
            delete newVersion.modifiedDate;
            deepEqual(newVersion, CREATE_ONE_CONTAINER);
        } finally {
            await service.putSystem(CREATE_ONE_CONTAINER.code, app);
        }
    });

    test('Публикация двух контейнеров для пустой системы', async () => {
        const service = new SystemService();

        const app = await service.getByCode(CREATE_TWO_CONTAINERS.code, { level: CONTAINERS_LEVEL });
        try {
            assert(app.containers && app.containers.length === 0, "Приложение для проверки должно быть без контейнеров");

            const updated = await service.putSystem(CREATE_TWO_CONTAINERS.code, CREATE_TWO_CONTAINERS);
            const newVersion = JSON.parse(JSON.stringify(await service.getByCode(CREATE_TWO_CONTAINERS.code, { level: CONTAINERS_LEVEL })));
            delete newVersion.modifiedDate;
            deepEqual(newVersion, CREATE_TWO_CONTAINERS);
        } finally {
            await service.putSystem(CREATE_TWO_CONTAINERS.code, app);
        }
    });

    test('Публикация контейнера с интерфейсом для пустой системы', async () => {

        const service = new SystemService();

        const app = await service.getByCode(CREATE_CONTAINER_INTERFACE.code, { level: INTERFACES_LEVEL });

        try {
            assert(app.containers && app.containers.length === 0, "Приложение для проверки должно быть без контейнеров");

            const updated = await service.putSystem(CREATE_CONTAINER_INTERFACE.code, CREATE_CONTAINER_INTERFACE);
            const newVersion = JSON.parse(JSON.stringify(await service.getByCode(CREATE_CONTAINER_INTERFACE.code, { level: INTERFACES_LEVEL })));
            delete newVersion.modifiedDate;
            deepEqual(newVersion, CREATE_CONTAINER_INTERFACE);
        } finally {
            await service.putSystem(CREATE_CONTAINER_INTERFACE.code, app);
        }
    });

    test('Публикация api с SLA для пустой системы', async () => {

        const service = new SystemService();

        const app = await service.getByCode(CREATE_SLA.code, { level: METHODS_LEVEL });

        try {
            assert(app.containers && app.containers.length === 0, "Приложение для проверки должно быть без контейнеров");

            const updated = await service.putSystem(CREATE_SLA.code, CREATE_SLA);
            const newVersion = JSON.parse(JSON.stringify(await service.getByCode(CREATE_SLA.code, { level: METHODS_LEVEL })));
            delete newVersion.modifiedDate;
            deepEqual(newVersion, CREATE_SLA);
        } finally {
            await service.putSystem(CREATE_SLA.code, app);
        }
    });
});


suite("Обновление данных для системы", async () => {
    before(async () => {
        updateEnv();
        SparxRepositoryPackagesOptions.init();
    });

    test("Изменение кода контейнера", async () => {
        const service = new SystemService();
        const app = await service.getByCode(CHANGE_CONTAINER_CODE.code, { level: METHODS_LEVEL });
        try {
            const new_data = { ...CHANGE_CONTAINER_CODE, containers: [NEW_CONTAINER] }
            const updated = await service.putSystem(CHANGE_CONTAINER_CODE.code, new_data);
            const newVersion = JSON.parse(JSON.stringify(await service.getByCode(CHANGE_CONTAINER_CODE.code, { level: METHODS_LEVEL })));
            delete newVersion.modifiedDate;
            deepEqual(newVersion, new_data);
        } finally {
            await service.putSystem(CHANGE_CONTAINER_CODE.code, CHANGE_CONTAINER_CODE);
        }
    });

    test("Убрать дубли методов при публикации", async () => {
        const service = new SystemService();

        await insertMethods('ext_orcs_api.ext_mordor.remove-doubles', [
            {
                name: "GET /orcs",
                rps: 10
            },
            {
                name: "GET /orcs",
                rps: 11
            },
            {
                name: "GET /orcs",
                rps: 12
            }
        ])

        const app = await service.getByCode(REMOVE_DOUBLES.code, { level: METHODS_LEVEL });
        const updated = await service.putSystem(REMOVE_DOUBLES.code, REMOVE_DOUBLES);
        const newVersion = JSON.parse(JSON.stringify(await service.getByCode(REMOVE_DOUBLES.code, { level: METHODS_LEVEL })));
        delete newVersion.modifiedDate;
        deepEqual(newVersion, REMOVE_DOUBLES);
    });

    test("Добавление метода", async ()=>{
        const service = new SystemService();
        const newVersion = JSON.parse(JSON.stringify(await service.putSystem(ADD_INTERFACE_METHOD.code, ADD_INTERFACE_METHOD)));
        delete newVersion.modifiedDate;
        deepEqual(newVersion, ADD_INTERFACE_METHOD);
    })
});

suite( "Валидация", async ()=>{
    before(async () => {
        updateEnv();
        SparxRepositoryPackagesOptions.init();
    });
    test("У контейнера нет кода", async()=>{
        try{
            const service = new SystemService();
            await service.putSystem( CONTAINER_WITHOUT_CODE.code, CONTAINER_WITHOUT_CODE);
        }catch( e ){
            return;
        }
        assert(false);
    })

    test("У контейнера code=null", async()=>{
        try{
            const service = new SystemService();
            await service.putSystem( CONTAINER_NULL_CODE.code, CONTAINER_NULL_CODE);
        }catch( e ){
            return;
        }
        assert(false);
    });

    test("У контейнера пустой код", async()=>{
        try{
            const service = new SystemService();
            await service.putSystem( CONTAINER_EMPTY_CODE.code, CONTAINER_EMPTY_CODE);
        }catch( e ){
            return;
        }
        assert(false);
    });

    test("У интерфейса отсутствует код", async()=>{
        try{
            const service = new SystemService();
            await service.putSystem( INTERFACE_WITHOUT_CODE.code, INTERFACE_WITHOUT_CODE);
        }catch( e ){
            return;
        }
        assert(false);
    });

    test("У интерфейса code=null", async()=>{
        try{
            const service = new SystemService();
            await service.putSystem( INTERFACE_NULL_CODE.code, INTERFACE_NULL_CODE);
        }catch( e ){
            return;
        }
        assert(false);
    });

    test("У интерфейса пустой код", async()=>{
        try{
            const service = new SystemService();
            await service.putSystem( INTERFACE_EMPTY_CODE.code, INTERFACE_EMPTY_CODE);
        }catch( e ){
            return;
        }
        assert(false);
    });
})
