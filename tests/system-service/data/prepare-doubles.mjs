import { randomUUID } from "node:crypto";
import eaRepository from "../../../src/api/repositories/sparx-ea-repository/ea-repository.mjs";
import { t_object, t_operation } from "../../../src/api/repositories/sparx-ea-repository/index.mjs";

/**
 * 
 * @param {string} interfaceCode 
 * @param {{name:string, rps, latency, error_rate}[]} doubles 
 */
export async function insertMethods(interfaceCode, doubles) {
    const apiRows = await eaRepository.query(`SELECT * FROM t_object WHERE LOWER(alias)=LOWER($1) AND object_type='Interface' AND status<>'REMOVED'`, interfaceCode);
    if (!apiRows.length) throw Error(`Не найден итенрфейс с кодом ${interfaceCode}`);
    if (apiRows.length > 1) throw Error(`Найдено несколько инетрфейсов с кодом ${interfaceCode}`);
    /** @type {t_object} */
    const apiData = apiRows[0];
    for (const method of doubles) {
        /** @type {t_operation} */
        const methodData = await eaRepository.insert(t_operation, { object_id: apiData.object_id, name: method.name, ea_guid: randomUUID().toUpperCase() });
        await eaRepository.updateOperationTags(methodData.operationid, { rps: method.rps, latency: method.latency, error_rate: method.error_rate });
    }
}