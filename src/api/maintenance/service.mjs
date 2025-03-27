import { NotImplemented } from "../../utils/errors.mjs";
import eaRepository from "../repositories/sparx-ea-repository/ea-repository.mjs";
import { DoublesInterface } from "./model.mjs";
import { SELECT_METHOD_DOUBLES } from "./query.mjs";

export class MaintenanceService {
    async getMethodsDoubles() {
        /** @type {Array<{method:string, operation_guid, interface,api_uid,fqname,rps,latency,error_rate, diagram, diagram_uid, removed_date, message }>} */
        const rows = await eaRepository.query(SELECT_METHOD_DOUBLES);
        const doubles = {};
        for (const row of rows) {
            /** @type { DoublesInterface} */
            const api = doubles[row.api_uid] ?? (doubles[row.api_uid] = new DoublesInterface(row.interface, row.api_uid,row.code, row.fqname));
            api.addMethodDouble(row.operation_guid, row.method, row.rps, row.latency, row.error_rate, row.diagram, row.diagram_uid, row.removed_date, row.parameters);
        }
        return Object.values(doubles);
    }
}