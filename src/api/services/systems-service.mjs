import { NotFound, NotImplemented } from "../../utils/errors.mjs";
import dataService from '../data/systems-data-service.mjs'
import System, { Container } from "../model/system.mjs";

const STEREOTYPE_MAP = {
    ArchiMate_TechnicalCapability: "TechnicalCapability",
    ArchiMate_Capability: "Capability",
    Package: "Domain"
}
function sliceCode(code, postfixCode) {
    if (!code) return null;
    if (!code.endsWith(postfixCode)) return null;
    return code.slice(0, - postfixCode.length - 1);
}

function buildSystems(rows, methods = []) {
    const systems = {}
    for (const row of rows) {
        /** @type {System} */
        const system = systems[row.sys_code] ?? (systems[row.sys_code] = new System({
            name: row.system, code: row.sys_code,
            description: row.sys_description,
            ...row
        }));

        const container_code = sliceCode(row.container_code, row.sys_code);
        if (container_code) {
            /**
             * @type {Container}
             */
            const container = system.containerByCode(container_code) ?? system.addContainer({
                name: row.container,
                code: container_code,
                version: row.container_version,
                description: row.container_description
            });
            const interface_code = sliceCode(row.interface_code, row.container_code);
            if (interface_code) {
                const api = container.interfaceByCode(interface_code) ?? container.addInterface({
                    name: row.interface,
                    code: interface_code, version: row.interface_version,
                    ...row
                });
            }
        }
    }
    return systems;
}
class SystemService {
    async getAll(options = {}) {
        const { excludeContainers, includeMethods } = options;
        if (includeMethods)
            NotImplemented();

        if (excludeContainers) {
            return (await dataService.selectOnlySystems()).map(s => new System({ name: s.system, ...s }));
        };

        const rows = await dataService.selectSystems();
        const systems = buildSystems(rows);
        return Object.values(systems);
    }

    async getByCode(code, options = {}) {
        const { excludeContainers, includeMethods } = options;
        if (includeMethods)
            NotImplemented();

        if (excludeContainers) {
            const row = await dataService.selectOnlySystemByCode(code);
            if (!row) NotFound(`The system with the ${code} code was not found`)
            return new System(row);
        };

        const rows = await dataService.selectSystemByCode(code);
        const systems = buildSystems(rows);
        return systems[code];
    }
    async putSystem(system) {
        NotImplemented();
    }
    async getPurpose(systemCode) {
        const rows = await dataService.selectSystemCapabilities(systemCode);

        const capabilityMap = {};

        for (const row of rows) {
            const capability = Object.assign(capabilityMap[row.object_id] ?? (capabilityMap[row.object_id] = {}), { name: row.name, code: row.code, type: STEREOTYPE_MAP[row.stereotype] })
            if (row.child_id == row.object_id)
                continue;
            const child = capabilityMap[row.child_id] ?? (capabilityMap[row.child_id] = {});
            (capability.children ?? (capability.children = [])).push(child);
        }

        return Object.values(capabilityMap).find( r=>r.code='GRP.000')
        console.log(rows)
        NotImplemented();
    }
}

export default new SystemService();