import express from 'express'
import {
    arraySchema,
    GetJSONOperation,
    pathParameter,
    SimpleServiceSpecification,
    stringProperty
} from "../specifications/helpers.mjs";
import { BadRequest, NotImplemented } from "../../utils/errors.mjs";
import fdmStorage from "../repositories/fdm-storage.mjs";

export class HistoryService {
    async getSystemHistory(code, date_from, date_to) {
        const records = await (async () => {
            if (!date_from && !date_to)
                return fdmStorage.query(`SELECT log_date FROM arch_metrics.put_system_log WHERE LOWER(system_code)=LOWER($1)`, code);
            if (date_from && !date_to)
                return fdmStorage.query(`SELECT log_date FROM arch_metrics.put_system_log WHERE LOWER(system_code)=LOWER($1) AND log_date>$2`, code, date_from);
            if (!date_from && date_to)
                return fdmStorage.query(`SELECT log_date FROM arch_metrics.put_system_log WHERE LOWER(system_code)=LOWER($1) AND log_date<$2`, code, date_to);
            return fdmStorage.query(`SELECT log_date FROM arch_metrics.put_system_log WHERE LOWER(system_code)=LOWER($1) AND log_date<$2 AND log_date>$3`, code, date_to, date_from);
        })();

        return records;
    }
}

const service = new HistoryService();
export class HistoryControllers {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     */
    async getSystemHistory(request, response) {
        if (!request.params.code)
            throw BadRequest("Отсутствует код системы");
        response.json(await service.getSystemHistory(request.params.code));
    }
}


export const SYSTEM_HISTORY_RESOURCE = "/api/v4/history/systems/{code}";

const controllers = new HistoryControllers();

const SWAGGER = new SimpleServiceSpecification(`История изменений`, `Получение информации об истории изменений`);
const systemCode = pathParameter("code", "Код системы", "CT.INAC.FTTB");

const SYSTEM_HISTORY_RECROD_REF = SWAGGER.defineEntitySchema("SystemHistoryRecord", {
    type: "object",
    properties: {
        log_date: {
            type: "string"
        },
        current_state: {
            type: "object"
        },
        target_state: {
            type: "object"
        },
        result_state: {
            type: "object"
        }
    }
})

SWAGGER.defineGet(SYSTEM_HISTORY_RESOURCE, new GetJSONOperation("Получение истории изменений", [systemCode], arraySchema(SYSTEM_HISTORY_RECROD_REF), controllers.getSystemHistory));

export { SWAGGER as historyConstrollerSwagger };
