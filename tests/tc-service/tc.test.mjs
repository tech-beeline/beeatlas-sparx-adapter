import { before, after, suite, test } from 'node:test';
import assert, { deepEqual, deepStrictEqual, strictEqual } from 'assert';
import { readEnv } from '../env.mjs';
import { TechnicalCapabiliiesService } from '../../src/api/services/index.mjs'
import { SparxRepositoryPackagesOptions } from '../../src/api/repositories/sparx-ea-repository/options.mjs';

const FDM_TC_CODE = "FDMSHOWCASEAPP.001";
const NEW_DESCRIPTION = "description v2";

const FDM_TC = {
    code: "FDMSHOWCASEAPP.001",
    name: "Возможность получения данных о business capability",
    description: "Возможность получить информацию о бизнес-возможностях и доменах которым они принадлежат по коду возможности и домена",
    author: "FDM API",
    status: "Created",
    version: "1.0",
    goal_from: "24Q4",
    goal_to: "25Q4",
    parents: [
        {
            code: "BC-007366",
            href: "/api/v4/capabilities/BC-007366",
        },
        {
            code: "BC-018364",
            href: "/api/v4/capabilities/BC-018364",
        },
    ],
    system: {
        code: "FDMSHOWCASEAPP",
        href: "/api/v4/systems/FDMSHOWCASEAPP",
    },
};

const FDM_TC_V2 = {
    code: "FDMSHOWCASEAPP.001",
    name: "Возможность получения данных о business capability",
    description: "Возможность получить информацию о бизнес-возможностях и доменах которым они принадлежат по коду возможности и домена",
    author: "FDM API",
    status: "Created",
    version: "1.0",
    goal_from: "24Q4",
    goal_to: "25Q4",
    parents: [
        {
            code: "BC-007366",
            href: "/api/v4/capabilities/BC-007366",
        },

    ],
    system: {
        code: "FDMSHOWCASEAPP",
        href: "/api/v4/systems/FDMSHOWCASEAPP",
    },
};

const tcService = new TechnicalCapabiliiesService();

suite("Технические возможности", async () => {
    before(async () => {
        readEnv();
        await SparxRepositoryPackagesOptions.init();
        await tcService.putTC(FDM_TC);
    });
    test("Получение списка ТС", async (t) => {
        const tc_list = await tcService.getAll();
        assert(tc_list.length);
        const fdm_tc = tc_list.find(tc => tc.code === FDM_TC_CODE);
        assert(fdm_tc);
        fdm_tc.createdDate = undefined;
        fdm_tc.modifiedDate = undefined
        deepStrictEqual(JSON.parse(JSON.stringify(fdm_tc)), FDM_TC);
    });

    test(`Получение FDMHSOWCASEAPP.001`, async (t) => {
        const fdm_tc = await tcService.getByCode(FDM_TC_CODE);
        assert(fdm_tc);
        fdm_tc.createdDate = undefined;
        fdm_tc.modifiedDate = undefined
        deepStrictEqual(JSON.parse(JSON.stringify(fdm_tc)), FDM_TC);
    });

    test(`Получение fdmshowcaseapp.001`, async (t) => {
        const fdm_tc = await tcService.getByCode(FDM_TC_CODE.toLowerCase());
        assert(fdm_tc);
        fdm_tc.createdDate = undefined;
        fdm_tc.modifiedDate = undefined
        deepStrictEqual(JSON.parse(JSON.stringify(fdm_tc)), FDM_TC);
    })

    test(`Обновление FDMSHOWCASEAPP.001 -  change description`, async (t) => {
        after(async () => {
            await tcService.putTC(FDM_TC);
        });

        const fdm_tc_v1 = await tcService.getByCode(FDM_TC_CODE);
        assert(fdm_tc_v1);
        const fdm_tc_new_version = { ...fdm_tc_v1, description: NEW_DESCRIPTION };
        const fdm_tc_v2 = { ...await tcService.putTC(fdm_tc_new_version) };
        const fdm_tc_v2_check = { ...await tcService.getByCode(FDM_TC_CODE) };
        fdm_tc_new_version.createdDate = undefined;
        fdm_tc_new_version.modifiedDate = undefined;
        fdm_tc_v2.createdDate = undefined;
        fdm_tc_v2.modifiedDate = undefined;
        fdm_tc_v2_check.createdDate = undefined;
        fdm_tc_v2_check.modifiedDate = undefined;
        deepEqual(fdm_tc_v2, fdm_tc_new_version);
        deepEqual(fdm_tc_v2_check, fdm_tc_new_version);
        //Вернуть обратно

    })

    test(`Обновление fdmshowcaseapp.001 -  change description`, async (t) => {
        after(async () => {
            await tcService.putTC(FDM_TC);
        });

        const fdm_tc_v1 = await tcService.getByCode(FDM_TC_CODE);
        assert(fdm_tc_v1);
        const fdm_tc_new_version = { ...fdm_tc_v1, description: NEW_DESCRIPTION, code: FDM_TC_CODE.toLowerCase() };
        const fdm_tc_v2 = { ...await tcService.putTC(fdm_tc_new_version) };
        const fdm_tc_v2_check = { ...await tcService.getByCode(FDM_TC_CODE.toLowerCase()) };
        fdm_tc_new_version.createdDate = undefined;
        fdm_tc_new_version.modifiedDate = undefined;
        fdm_tc_v2.createdDate = undefined;
        fdm_tc_v2.modifiedDate = undefined;
        fdm_tc_v2_check.createdDate = undefined;
        fdm_tc_v2_check.modifiedDate = undefined;
        fdm_tc_new_version.code = FDM_TC_CODE;
        deepEqual(fdm_tc_v2, fdm_tc_new_version);
        deepEqual(fdm_tc_v2_check, fdm_tc_new_version);
    })

    test(`Обновление fdmshowcaseapp.001 -  изменение родительских BC`, async (t) => {
        after(async () => {
            await tcService.putTC(FDM_TC);
        });

        const fdm_tc_v2 = { ...await tcService.putTC(FDM_TC_V2) };
        const fdm_tc_v2_check = { ...await tcService.getByCode(FDM_TC_CODE.toLowerCase()) };
        deepEqual( fdm_tc_v2, fdm_tc_v2_check);
        deepEqual( FDM_TC_V2.parents, fdm_tc_v2.parents);
    });
});