import { suite, test } from 'node:test';
import assert, { deepEqual, deepStrictEqual, strictEqual } from 'assert';
import { readEnv } from '../env.mjs';
import { TechnicalCapabiliiesService } from '../../src/api/services/index.mjs'

readEnv();
const FDM_TC_CODE = "FDMSHOWCASEAPP.001";

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

const tcService = new TechnicalCapabiliiesService();

suite("Технические возможности", async () => {
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
        const fdm_tc = await tcService.getByCode( FDM_TC_CODE);
        assert(fdm_tc);
        fdm_tc.createdDate = undefined;
        fdm_tc.modifiedDate = undefined
        deepStrictEqual(JSON.parse(JSON.stringify(fdm_tc)), FDM_TC);
    })
});