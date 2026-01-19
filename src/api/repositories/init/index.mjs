import fs from "fs/promises";

import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { NotImplemented } from "../../../utils/errors.mjs";
import { APPLICATION_CATALOGUE_STEREOTYPE, CATALOGUE_STEREOTYPES, CATALOGUES, CATALOGUES_ALIAS, E2E_CATALOGUE_STEREOTYPE, SELECT_FDM_OBJECTS, SELECT_FMD_MODEL, SELECT_MIGRATION_HISTORY, SELECT_SCHEMA_TABLE, TC_CATALOGUE_STEREOTYPE } from "./const.mjs";
import fdmStorage from "../fdm-storage.mjs";


const isEATableExists = async (table) => {
    const result = await eaRepository.query(SELECT_SCHEMA_TABLE, table, 'public');
    return result.length;
}

async function executeSparxScript() {
    if (await isEATableExists('t_object')) {
        console.log(`EA sparx tables exists`);
        return;
    }
    console.log('Execute sparx init script');

    const sparx_init_script = (await fs.readFile('src/resources/db/migration/sparx/EASchema_1558_PostgreSQL.sql')).toString();
    await eaRepository.query(sparx_init_script);

    console.log(`Update stereotypes`);
    const init_stereotypes = (await fs.readFile('src/resources/db/migration/sparx/INIT_STEREOTYPE.sql')).toString();
    await eaRepository.query(init_stereotypes);

    console.log(`Sparx init script was executed successfully`);
    return;
}

let fdm_model_package_id = null;

const getFDMMdoelPackageId = async () => {
    if (!fdm_model_package_id) {
        const r = await eaRepository.query(SELECT_FMD_MODEL);
        if (r.length) {
            fdm_model_package_id = r[0].package_id;
            return fdm_model_package_id;
        }
        console.log(`FDM Model not found, create FDM model`);
        const p = await eaRepository.createPackage({
            parent_id: 0,
            name: 'FMD Model'
        });
        fdm_model_package_id = p.package_id
    }
    return fdm_model_package_id;
}

async function migrateFDMStructure() {
    const result = await eaRepository.query(SELECT_FDM_OBJECTS);
    for (const stereotype of CATALOGUE_STEREOTYPES) {
        const catalogue = result.find(c => c.stereotype === stereotype);
        if (!catalogue) {
            console.log(`Catalogue with stereotype=[${stereotype}] not found`);
            const package_id = await getFDMMdoelPackageId();
            await eaRepository.createPackage({
                parent_id: package_id,
                name: CATALOGUES[stereotype],
                stereotype: stereotype,
                alias: CATALOGUES_ALIAS[stereotype]
            });
        }
    }
}


async function migrateFDMDB() {
    const table_info = await fdmStorage.query(SELECT_SCHEMA_TABLE, 'migration_history', 'arch_metrics');
    if (!table_info.length) {
        console.log(`Init arch_metrics schema`);
        const init_script = (await fs.readFile('src/resources/db/migration/arch_metrics/V0000_INIT.sql')).toString();
        await fdmStorage.query(init_script);
        console.log(`arch_metrics schema was initialized successfully`);
    }

    /**
     * @type {{ migration_date, version}[]}
     */
    const migration_history = await fdmStorage.query(SELECT_MIGRATION_HISTORY);

    const schema_version = migration_history[0]?.version || '00000';
    console.log(`arch_metrics schema version=${schema_version}`);

    const rx = /^V\d\d\d\d/g;
    const SCRIPT_DIR = 'src/resources/db/migration/arch_metrics/';
    const scripts = (await fs.readdir(SCRIPT_DIR))
        .map(s => [s.match(rx), s])
        .filter(v => v[0])
        .filter(v => v[0][0] > schema_version) // skip migrated version
        .sort((a, b) => a[1] - b[1]);

    for (const [[version], file] of scripts) {
        console.log(`Update arch_metrics schema (version=${version})`);
        const script = (await fs.readFile(`${SCRIPT_DIR}${file}`)).toString();
        await fdmStorage.query(script);
        await fdmStorage.query(`INSERT INTO arch_metrics.migration_history(version) VALUES($1)`, version);
        console.log(`arch_metrics schema was updated successfully (version=${version})`);
    }
}

export async function migrateSparxRepository() {
    console.info('Check if ea repository need init')
    if (!await isEATableExists('t_object')) {
        console.info('ea repository need execute sparx script');
        await executeSparxScript();
    }
    await migrateFDMStructure();
}


export async function initDatabases() {
    await migrateSparxRepository();
    await migrateFDMDB();
}

export const initDbPromise = initDatabases();
