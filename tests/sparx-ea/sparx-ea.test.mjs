import { before, after, suite, test } from 'node:test';
import assert, { deepEqual, deepStrictEqual, strictEqual } from 'assert';
import { updateEnv } from '../env.mjs';
import { SparxRepository } from '../../src/api/repositories/index.mjs';

const PACKAGE_DELETE_ALIAS = 'PACKAGE_TO_DELETE'

suite("delete", async () => {
    before(async () => {
        updateEnv();
    })
    /*
    const repository = new SparxRepository();
    test("delete object", async () => {
        await repository.deleteObject(202642)
    });

    test("delete package", async () => {
        const p = await repository.query(`SELECT package_id FROM t_package where ea_guid in (SELECT ea_guid FROM t_object WHERE alias=$1)`, PACKAGE_DELETE_ALIAS);
        if (!p.length)
            throw Error(`pacakge with alias=${PACKAGE_DELETE_ALIAS}`);
        await repository.deletePackage(p[0].package_id);
    })
        */
})