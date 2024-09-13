import { BadRequest, NotFound, NotImplemented } from "../../utils/errors.mjs";
import { buildHREF } from "../controllers/controller-decorator.mjs";
import ArchMetricsStorage from "../data/arch-metrics-storage.mjs";
import dataService from '../data/systems-data-service.mjs'
import System, { Container, E2EProcessContext, SysemAssessmentStatus } from "../model/system.mjs";
import { CAPABILITY_LIST_RESOURCE, TC_LIST_RESOURCE } from "../specifications/paths.mjs";

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
    constructor() {
        this.getByCode = this.getByCode.bind(this);
    }
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

    /**
     * 
     * @param {string} code 
     * @param {*} options 
     * @returns {Promise<System>}
     */
    async getByCode(code, options = {}) {
        // [ ] Изменить логику получения (уйти от денормализованных запросов)
        const { excludeContainers, includeMethods } = options;
        if (includeMethods)
            NotImplemented();

        if (excludeContainers) {
            const row = await dataService.selectOnlySystemByCode(code);
            if (!row) throw NotFound(`The system with the ${code} code was not found`)
            return new System(row);
        };

        const rows = await dataService.selectSystemByCode(code);
        if (!rows.length) return null;
        const systems = buildSystems(rows);
        return systems[code];
    }
    async getSystemContainers(systemCode) {
        return dataService.selectSystemContainers(systemCode)
            .then(rows => rows.map(row => new Container(row)));
    }
    /**
     * 
     * @param {string} code 
     * @param {System} system 
     */
    async putSystem(code, system) {
        if (!code) throw BadRequest('Code parameter is not specified');
        if (!system) throw BadRequest('System is not specified');
        const containerWithoutCode = system.containers.find(c => !c.code);
        if (containerWithoutCode) {
            throw BadRequest(`Container ${JSON.stringify(containerWithoutCode)} has no code`)
        }

        const currentSystem = await this.getByCode(code, { excludeContainers: true });
        if (!currentSystem) throw NotFound(`System with code=${code} was not found`);

        const containerMap = (await this.getSystemContainers(code)).reduce((acc, v) => Object.assign(acc, { [v.code]: { current: v } }), {})
        system.containers.forEach(c => (containerMap[c.code] ?? (containerMap[c.code] = {})).target = c);
        const newContianers = Object.values(containerMap).filter( c=>!c.current)

        NotImplemented();
    }
    async getPurpose(systemCode) {
        const rows = await dataService.selectSystemCapabilities(systemCode);

        const capabilityMap = {};

        for (const row of rows) {
            const type = STEREOTYPE_MAP[row.stereotype];
            const capability = Object.assign(capabilityMap[row.object_id] ?? (capabilityMap[row.object_id] = {}),
                {
                    name: row.name, code: row.code, type: type,
                    href: buildHREF(`${type === 'TechnicalCapability' ? TC_LIST_RESOURCE : CAPABILITY_LIST_RESOURCE}/${row.code}`)
                })
            if (row.child_id == row.object_id)
                continue;
            const child = capabilityMap[row.child_id] ?? (capabilityMap[row.child_id] = {});
            (capability.children ?? (capability.children = [])).push(child);
        }

        return Object.values(capabilityMap).find(r => r.code = 'GRP.000') ?? { children: [] }
    }
    async getE2EParticipition(systemCode) {
        return (await dataService.selectSystemE2EParticipition(systemCode))
            .map(r => new E2EProcessContext(r));
    }

    /**
     * 
     * @param {SysemAssessmentStatus} assessmentStatus 
     */
    async addAssessmentStatus(systemCode, assessmentStatus) {
        await ArchMetricsStorage.upsertSystemAssessment(
            systemCode,
            assessmentStatus.fitness_function_code,
            assessmentStatus.assessment_date ?? Date(),
            assessmentStatus.assessment_description,
            assessmentStatus.status,
            assessmentStatus.result_details);

        return { message: "Архитектурная оценка добавлена" };
    }
    /**
    * 
    * @param {SysemAssessmentStatus} assessmentStatus 
    */
    async getSystemAssessments(systemCode) {
        return (await ArchMetricsStorage.selectSystemAssessments(systemCode)).map(a => new SysemAssessmentStatus(a));
    }
}

export default new SystemService();