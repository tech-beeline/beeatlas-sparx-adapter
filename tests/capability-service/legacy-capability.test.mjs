import { before, after, suite, test } from 'node:test';
import assert, { deepEqual, deepStrictEqual, strictEqual } from 'assert';
import { readEnv } from '../env.mjs';
import { SparxRepositoryPackagesOptions } from '../../src/api/repositories/sparx-ea-repository/options.mjs';
import { CapabilityService } from '../../src/api/services/index.mjs';
import { BC_018364, DMN_153, FOOL_STATE_DOMAIN, GRP_000 } from './resources/legacy-data.mjs';


suite("Получение возможностей", async () => {
    before(async () => {
        readEnv();
    });

    test("Получить GRP.00", async () => {
        const service = new CapabilityService();

        const grp_000 = await service.getByCode('GRP.000');
        assert(grp_000);
        grp_000.createdDate = undefined;
        deepEqual(JSON.parse(JSON.stringify(grp_000)), GRP_000);
    });

    test("ПОлучить DMN.153", async () => {
        const service = new CapabilityService();

        const dmn_153 = await service.getByCode('DMN.153');
        assert(dmn_153);
        dmn_153.createdDate = undefined;
        deepEqual(JSON.parse(JSON.stringify(dmn_153)), DMN_153);
    });

    test("Получить BC-018364", async () => {
        const service = new CapabilityService();

        const bc_018364 = await service.getByCode(BC_018364.code);
        assert(bc_018364);
        bc_018364.createdDate = undefined;
        deepEqual(JSON.parse(JSON.stringify(bc_018364)), BC_018364);
    });
});

suite("Обновление возможностей", async () => {
    before(async () => {
        readEnv();
    });

    test("Создание домена \"Страна дураков\"", async () => {
        const service = new CapabilityService();
        await service.putCapability(FOOL_STATE_DOMAIN.code,FOOL_STATE_DOMAIN);

        throw Error('TODO')
    })
});