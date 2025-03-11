import { before, after, suite, test } from 'node:test';
import assert, { deepEqual, deepStrictEqual, strictEqual } from 'assert';
import { readEnv } from '../env.mjs';
import { SparxRepositoryPackagesOptions } from '../../src/api/repositories/sparx-ea-repository/options.mjs';
import { CapabilityService } from '../../src/api/services/index.mjs';
import { BC_018364, DMN_153, FOOL_STATE_DOMAIN, GRP_000, TEST_CAPABILITY } from './resources/legacy-data.mjs';
import eaRepository from '../../src/api/repositories/sparx-ea-repository/ea-repository.mjs';


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
        const p = await eaRepository.getPackageByAlias(FOOL_STATE_DOMAIN.code);
        if (p) await eaRepository.deletePackage(p.package_id);
        const o = await eaRepository.queryOne('SELECT * FROM t_object where LOWER(alias)=LOWER($1)', [TEST_CAPABILITY.code])
        if (o) await eaRepository.deleteObject(o.object_id);
    });

    after(async () => {
        const p = await eaRepository.getPackageByAlias(FOOL_STATE_DOMAIN.code);
        if (p) await eaRepository.deletePackage(p.package_id);
        const o = await eaRepository.queryOne('SELECT * FROM t_object where LOWER(alias)=LOWER($1)', [TEST_CAPABILITY.code])
        if (o) await eaRepository.deleteObject(o.object_id);
    })

    const service = new CapabilityService();

    test("Создание и обновление домена \"Страна дураков\"", async () => {
        await service.putCapability(FOOL_STATE_DOMAIN.code, FOOL_STATE_DOMAIN);
        const cap = await service.getByCode(FOOL_STATE_DOMAIN.code);
        cap.createdDate = undefined;
        assert(cap);
        deepStrictEqual(JSON.parse(JSON.stringify(cap)), FOOL_STATE_DOMAIN);
        cap.status = "Updated";
        await service.putCapability(FOOL_STATE_DOMAIN.code, cap);
    })

    test("Создание и обновление возможности \"Посадить 10 сольдо\"", async () => {
        await service.putCapability(TEST_CAPABILITY.code, TEST_CAPABILITY);
        const cap = await service.getByCode(TEST_CAPABILITY.code);
        cap.createdDate = undefined;
        assert(cap);
        deepStrictEqual(JSON.parse(JSON.stringify(cap)), TEST_CAPABILITY);
        cap.status = "Updated";
        await service.putCapability(TEST_CAPABILITY.code, cap);
    })
});