import { NotImplemented } from "../../../utils/errors.mjs";
import patchArray from "../../../utils/patch-array.mjs";
import { APIInterface, APIMethod } from "../../model/system.mjs";
import { interfaceRepository } from "../../repositories/index.mjs";

export class InterfacesService {

    /**
     * 
     * @param {{interface_code,interface_uid, method_name, rps,latency,error_rate}} sla 
     * @returns {Promise<{interface_code,interface_uid, method_name, rps,latency,error_rate}>}
     */
    async updateMethodSLA(sla) {
        const new_sla = await interfaceRepository.updateMethodSLA({
            interfaceCode: sla.interface_code,
            interfaceUID: sla.interface_uid,
            methodName: sla.method_name,
            rps: sla.rps,
            latency: sla.latency,
            error_rate: sla.error_rate
        })
        return {
            interface_code: new_sla.interfaceCode,
            interface_uid: new_sla.interfaceUID,
            method_name: new_sla.methodName,
            rps: new_sla.rps ?? undefined,
            latency: new_sla.latency ?? undefined,
            error_rate: new_sla.error_rate ?? undefined
        };
    }
}

export default new InterfacesService();