import { BadRequest, NotFound, NotImplemented } from "../../utils/errors.mjs";
import patchArray from "../../utils/patch-array.mjs";
import { buildHREF } from "../controllers/controller-decorator.mjs";
import ArchMetricsStorage from "../data/arch-metrics-storage.mjs";
import interfaceDataService from "../data/interface-data-service/index.mjs";
import systemsDataService from "../data/systems-data-service/index.mjs";
import dataService from '../data/systems-data-service/index.mjs'
import System, { Container, E2EProcessContext, SysemAssessmentStatus } from "../model/system.mjs";
import { CAPABILITY_LIST_RESOURCE, TC_LIST_RESOURCE } from "../specifications/paths.mjs";
import interfacesService from "./interfaces-service/index.mjs";

const REMOVED_STATUS = 'REMOVED';

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

function buildSystems(rows, methods = [], addRemoved = false) {
    const systems = {}
    const rowToBuild = addRemoved ? rows : rows.filter(r => r.container_status !== REMOVED_STATUS && r.interface_status !== REMOVED_STATUS);

    for (const row of rowToBuild) {
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
                description: row.container_description,
                status: row.container_status
            });

            //const interface_code = sliceCode(row.interface_code, row.container_code);
            if (row.interface_code) {
                const api = container.interfaceByCode(row.interface_code) ?? container.addInterface({
                    name: row.interface,
                    code: row.interface_code,
                    version: row.interface_version,
                    status: row.interface_status,
                    description: row.interface_description
                });
            }
        }
    }
    return systems;
}

export const GET_ALL_HANDLERS = {
    systems: () => dataService.selectSystems()
        .then(rows => rows.map(s => new System(s))),
    containers: async () => {
        const [systemsRows, containersRows] = await Promise.all([
            dataService.selectSystems(),
            dataService.selectSystemsContainers()
        ])
        const systemsMap = systemsRows.reduce((acc, v) => (acc[v.code] = new System(v), acc), {});
        containersRows.forEach(row => {
            systemsMap[row.sys_code]?.addContainer(row);
        })
        return Object.values(systemsMap);
    },
    interfaces: async () => {
        const [systemsRows, containersRows, interfacesRows] = await Promise.all([
            dataService.selectSystems(),
            dataService.selectSystemsContainers(),
            interfaceDataService.selectAllContainersInterfaces()
        ])
        const systemsMap = systemsRows.reduce((acc, v) => (acc[v.code] = new System(v), acc), {});
        const containersMap = {}
        containersRows.forEach(row => {
            systemsMap[row.sys_code]?.addContainer(containersMap[row.code] = new Container(row));
        });
        interfacesRows.forEach( row=>{
            containersMap[row.container_code]?.addInterface( row );
        });
        return Object.values(systemsMap);
    },
    methods: async ()=>{
        NotImplemented();
    }
}

class SystemService {
    constructor() {
        this.getByCode = this.getByCode.bind(this);
    }
    async getAll(options = {}) {
        const { level = 'systems' } = options;

        const handleLevel = GET_ALL_HANDLERS[level] ?? (() => { throw Error(`Invalid level parameter (${level})`) });
        return handleLevel();

        if ('systems' === level) {
            return (await dataService.selectSystems()).map(s => new System({ name: s.system, ...s }));
        };

        NotImplemented();
        const rows = await dataService.selectSystemsLegacy();
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
        const { level = 'systems' } = options;
        if ("systems" === level) {
            const row = await dataService.selectSystemByCode(code);
            if (!row) throw NotFound(`The system with the ${code} code was not found`)
            return new System(row);
        };
        if ("containers")
            NotImplemented();
    }
    async getSystemContainers(systemCode) {
        return dataService.selectSystemContainers(systemCode)
            .then(rows => rows.map(row => new Container(row)));
    }

    /**
     * 
     * @param {string} systemCode 
     * @param {Container} container
     */
    async addContainer(systemCode, container) {

        const currentContainer = await dataService.selectContainerByCode(container.code);
        if (currentContainer) throw Error(`Container with code=${container.code} already exists`)

        await dataService.insertContainer(
            systemCode,
            container.name,
            container.code,
            container.author,
            container.version,
            container.description);

        for (const interfaceData of container.interfaces) {
            await interfacesService.addInterface(interfaceData, container.code);
        }
    }
    /**
     * 
     * @param {string} systemCode 
     * @param {Array<{current:Container,target: Container}>} containers 
     */
    async updateContainer(systemCode, current, target) {
        const isContainersEqual = (a, b) => a.name === b.name && a.version === b.version && a.description === b.description;

        if (!isContainersEqual(current, target)) {
            await systemsDataService.updateContainer(
                target.name,
                target.code,
                target.author,
                target.version,
                target.description);
        }

        await patchArray(
            target.interfaces ?? [],
            await interfaceDataService.selectContainerInterfaces(target.code),
            it => it.code,
            (it) => interfacesService.addInterface(it, target.code),
            (currentInterface, targetInterface) => interfacesService.updateInterface(currentInterface, targetInterface),
            (it) => interfacesService.markInterfaceRemoved(it)
        )
    }
    /**
     * 
     * @param {string} systemCode 
     * @param {Container} container
     */
    async markContainerRemoved(systemCode, container) {
        if (container.status === 'REMOVED') {
            console.info(`Pass remove for removed container ${container.code}`);
            return;
        }

        await dataService.markContainerRemoved(container.name, container.code);
        // [ ] -проработать вопрос пакетной маркировки интерфейсов как удаленными
        for (const it of container.interfaces ?? []) {
            await interfacesService.markInterfaceRemoved(it);
        }
    }

    /**
     * 
     * @param {string} systemCode 
     * @param {System} system 
     */
    async putSystem(systemCode, system) {
        if (!systemCode) throw BadRequest('Code parameter is not specified');
        if (!system) throw BadRequest('System is not specified');
        const containerWithoutCode = system.containers.find(c => !c.code);
        if (containerWithoutCode) {
            throw BadRequest(`Container ${JSON.stringify(containerWithoutCode)} has no code`)
        }

        const currentSystemInfo = await this.getByCode(systemCode, { excludeContainers: true });
        if (!currentSystemInfo) throw NotFound(`System with code=${systemCode} was not found`);

        await patchArray(
            system.containers ?? [],
            await this.getSystemContainers(systemCode),
            c => c.code,
            (c) => this.addContainer(systemCode, c),
            (current, target) => this.updateContainer(systemCode, current, target),
            (c) => this.markContainerRemoved(systemCode, c)
        )

        return this.getByCode(systemCode);
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