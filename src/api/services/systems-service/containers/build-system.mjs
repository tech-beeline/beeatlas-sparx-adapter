import { NotImplemented } from "../../../../utils/errors.mjs";
import { APIInterface, APIMethod, Container } from "../../../model/system.mjs";
import { CONTAINERS_LEVEL, INTERFACES_LEVEL, SYSTEM_LEVEL } from "../const.mjs";



function getMethods(api, level) {
    if (level != INTERFACES_LEVEL) {
        return api.methods.map(m => new APIMethod(m));
    }
}

function getInterfaces(cn, level) {
    if (level !== CONTAINERS_LEVEL) {
        return Object.values(cn.interfaces).map(api => new APIInterface({
            name: api.interface_name,
            code: api.interface_code,
            status: api.interface_status,
            version: api.interface_version,
            description: api.interface_description,
            protocol: api.protocol,
            specification: api.specification,
            tcCode: api.tcCode,
            methods: getMethods(api, level)
        }))
    }
}
/**
 * 
 * @param {SystemDTOInternal} sys 
 * @param {*} level 
 */
export function getContainers(sys, level) {
    if (level !== SYSTEM_LEVEL) {
        return Object.values(sys.containers).map(c =>
            new Container({
                code: c.container_code,
                name: c.container_name,
                status: c.container_status,
                version: c.container_version,
                description: c.container_description,
                interfaces: getInterfaces(c, level)
            })
        );
    }
}