import { v4 as uuid } from "uuid";
import { NotFound, NotImplemented } from "../../../utils/errors.mjs";
import { KeyValueCache } from "../key-value-cache/index.mjs";
import eaRepository from "../sparx-ea-repository/ea-repository.mjs";
import { t_operation } from "../sparx-ea-repository/index.mjs";
import { SELECT_METHODS } from "./methods-queries.mjs";
import { tcRepository } from "../index.mjs";
import { mergeMethod } from "./merge-interfaces.mjs";

class MethodEntity {
    app_code;
    container_code;
    container_id;
    interface_code;
    interface_id;
    name;
    operation_guid;
    returnType;
    description;
    error_rate;
    latency;
    rps;
    removed_date;
    implements;
    key;
}

/**
 * 
 * @returns {Promise<MethodEntity[]>}
 */
const loadMethods = async () => {
    /**@type  */
    const methods = await eaRepository.query(SELECT_METHODS)
    methods.forEach(m => m.key = `${m.interface_code}:${m.name}`);
    return methods;
}

const dobuleMethodHandler = (a, val) => {
    console.warn(`Обнаружен дубль метода ${a.interface_code}:${a.name}`);
}

export class MethodRepository {


    async insert(api_id, method) {
        if (!api_id) throw Error(`api_id is not specified`);

        if (method.implements) {
            const tc = await tcRepository.byCode(method.implements);
            if (!tc) throw NotFound(`TC  с кодом [${method.implements}] не найден`);
        }

        const operation = await eaRepository.insert(t_operation, {
            object_id: api_id,
            name: method.name,
            notes: method.description,
            type: method.returnType,
            ea_guid: `{${uuid().toUpperCase()}}`
        })
        if (method.rps || method.latency || method.error_rate || method.implements) {
            return eaRepository.updateOperationTags(operation.operationid, {
                rps: method.rps,
                latency: method.latency,
                error_rate: method.error_rate,
                implements: method.implements
            })
        }
    }
    async update(method, data) {
        if (!method.operation_guid) throw Error(`operation_guid is not specified`);
        if (data.implements) {
            const tc = await tcRepository.byCode(data.implements);
            if (!tc) throw NotFound(`TC  с кодом [${data.implements}] не найден`);
        }

        const [operation] = await eaRepository.update(t_operation,
            {
                name: data.name,
                notes: method.description,
                type: data.returnType
            },
            { ea_guid: method.operation_guid });
        if (!operation)
            throw Error(`Ошибка приобновлении t_operation, вернулось 0 записей для ea_guid=${method.operation_guid}`);

        if (method.doubles) {
            console.warn(`Обнаружены дубли метода ${method.name}`);
            for (const m of method.doubles.filter(d => d.operationid !== method.operationid)) {
                await mergeMethod({ operationid: method.operationid, ea_guid: method.operation_guid }, m);
            }
        }

        return eaRepository.updateOperationTags(operation.operationid, {
            rps: data.rps,
            latency: data.latency,
            error_rate: data.error_rate,
            implements: data.implements,
            removedDate: data.removed
        })
    }

    async delete(method) {
        if (!method.operationid) throw Error(`operationid is not specified`);

        const using_rows = await eaRepository.queryOne(`SELECT COUNT(*) AS cnt
            FROM t_connectortag 
            WHERE property ='operation_guid'
            AND value=$1`, [method.operation_guid]);

        if (using_rows.cnt == 0) {
            return eaRepository.deleteOperation(method.operationid);
        }
        return eaRepository.updateOperationTags(method.operationid, { removedDate: new Date() });
    }
}

export const methodRepository = new MethodRepository();