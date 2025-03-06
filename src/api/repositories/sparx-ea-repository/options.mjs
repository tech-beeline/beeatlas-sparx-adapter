import { bootstrapAPI } from "../../bootstrap.mjs";
import { SparxRepository } from "./index.mjs";

export const APP_PACKAGE_ROOT_GUID = process.env.APP_PACKAGE_GUID ?? '{043ED25B-5EB6-4b6b-9A30-14C9CF0AD8A2}';
//export const BC_PACKAGE_ROOT_GUID = process.env.BC_PACKAGE_GUID ?? '{CC4EAE49-4A1B-4ef5-9C76-83D629ECF603}';

const SparxRepositoryInstance = new SparxRepository();

const SELECT_PACKAGE_OPTIONS = `
SELECT
    o.name, 
    o.ea_guid, 
    o.stereotype,
    p.package_id
FROM t_object o
    JOIN t_package p ON p.ea_guid=o.ea_guid
WHERE o.stereotype = ANY ($1)`;

class SparxRepositoryPackages {
    /**
     * @type {{name, ea_guid, stereotype, package_id}}
     */
    BusinessCapabilitiesCatalogue;
    E2EProcessCatalogue;
    ApplicationCatalogue;
    /** @type {{name, ea_guid, stereotype, package_id}} */
    TechCapabilitiesCatalogue;
    constructor() {
    }
    async init() {
        try {
            console.info(`Read SPARX package config: start`)
            const packagesRows = await SparxRepositoryInstance.queryRows(
                SELECT_PACKAGE_OPTIONS,
                [Object.keys(this)]);

            for (const row of packagesRows) {
                this[row.stereotype] = row;
            }
            console.info(`Read SPARX package config: done`)
        } catch (e) {
            console.error(e);
        }
    }
}

export const SparxRepositoryPackagesOptions = new SparxRepositoryPackages();

bootstrapAPI.addTask(async () => SparxRepositoryPackagesOptions.init());