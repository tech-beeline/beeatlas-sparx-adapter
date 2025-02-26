import monitoringService from "../../../legacy/services/monitoring-service.mjs";
import { BadRequest, NotFound, NotImplemented } from "../../../utils/errors.mjs";
import patchArray from "../../../utils/patch-array.mjs";
import { API_METRIC_TEMPLATE_TAG } from "../../const.mjs";
import { buildHREF } from "../../controllers/controller-decorator.mjs";
import SystemApiMonitoring, { ContainerApiMonitoring } from "../../model/observability/system-api-monitoring.mjs";

import System, { Container, E2EProcessContext, SysemAssessmentStatus } from "../../model/system.mjs";
import {
    ArchMetricsRepository,
    InterfacesRepository,
    MonitoringRepository,
    PtrArtifactsRepository,
    SystemsRepository
} from "../../repositories/index.mjs";
import { CAPABILITY_LIST_RESOURCE, TC_LIST_RESOURCE } from "../../specifications/paths.mjs";
import interfacesService from "../interfaces-service/index.mjs";
import GetAllSystems from "./get-all-systems.mjs";
import GetSystemByCode, { CONTAINERS_LEVEL, INTERFACES_LEVEL, METHODS_LEVEL, SYSTEM_LEVEL } from "./get-system-by-code.mjs";


const STEREOTYPE_MAP = {
    ArchiMate_TechnicalCapability: "TechnicalCapability",
    ArchiMate_Capability: "Capability",
    Package: "Domain",
    Domain: "Domain"
}

const interfacesRepository = new InterfacesRepository();
const systemsRepository = new SystemsRepository();
const ptrArtifactsRepositoryInstance = new PtrArtifactsRepository();
const monitoringRepository = new MonitoringRepository();

export class SystemService {
    constructor() {
        this.getByCode = this.getByCode.bind(this);
    }
    /**
     * 
     * @param {{level, addRemoved}} options 
     * @returns {Promise<Array<System>>}
     */
    async getAll(options = {}) {
        const { level = SYSTEM_LEVEL, addRemoved } = options;

        switch (level) {
            case SYSTEM_LEVEL: {
                return GetAllSystems.systems(addRemoved)
            }
            case CONTAINERS_LEVEL: {
                return GetAllSystems.withContainers(addRemoved)
                    .then(d => d.systems)
            }
            case INTERFACES_LEVEL: {
                return GetAllSystems.withInterfaces(addRemoved)
                    .then(d => d.systems)
            }
            case METHODS_LEVEL: {
                return GetAllSystems.withMethods(addRemoved);
            }
        }
    }

    /**
     * 
     * @param {string} code 
     * @param {*} options 
     * @returns {Promise<System>}
     */
    async getByCode(code, options = {}) {
        const { level = SYSTEM_LEVEL, addRemoved } = options;
        switch (level) {
            case SYSTEM_LEVEL: {
                return GetSystemByCode.system(code)
            }
            case CONTAINERS_LEVEL: {
                return GetSystemByCode.withContainers(code, addRemoved)
                    .then(d => d.system)
            }
            case INTERFACES_LEVEL: {
                return GetSystemByCode.withInterfaces(code, addRemoved)
                    .then(d => d.system)
            }
            case METHODS_LEVEL: {
                return GetSystemByCode.withMethods(code, addRemoved);
            }
        }
        NotImplemented();
    }

    async getSystemContainers(systemCode) {
        return systemsRepository.selectSystemContainers(systemCode)
            .then(rows => rows.map(row => new Container(row)));
    }

    /**
     * 
     * @param {string} systemCode 
     * @param {Container} container
     */
    async addContainer(systemCode, container) {

        const currentContainer = await systemsRepository.selectContainerByCode(container.code);
        if (currentContainer) throw Error(`Container with code=${container.code} already exists`)

        await systemsRepository.setContainer(
            systemCode,
            container.name,
            container.code,
            container.author,
            container.version,
            container.description);

        for (const interfaceData of container.interfaces ?? []) {
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
            await systemsRepository.updateContainer(
                target.name,
                target.code,
                target.author,
                target.version,
                target.description);
        }

        await patchArray(
            target.interfaces ?? [],
            await interfacesRepository.selectContainerInterfaces(target.code),
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

        await systemsRepository.markContainerRemoved(container.name, container.code);
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
        const containerWithoutCode = system.containers?.find(c => !c.code);
        if (containerWithoutCode) {
            throw BadRequest(`Container ${JSON.stringify(containerWithoutCode)} has no code`)
        }

        const containers = system.containers ?? [];

        await systemsRepository.setSystemContainers(systemCode, containers);

        console.info(`${systemCode} - Обновление информации об интерфейсах`);

        for( const container of containers ){
            await interfacesRepository.setContainerInterfaces(container.code, container.interfaces)
        }
        console.info(`${systemCode} - Обновление информации об интерфейсах завершено`);

        return this.getByCode(systemCode, { level: "methods" });
    }


    async getPurpose(systemCode) {
        const rows = await systemsRepository.selectSystemCapabilities(systemCode);

        const capabilityMap = {};

        for (const row of rows) {
            const type = STEREOTYPE_MAP[row.type];
            const capability = Object.assign(
                capabilityMap[row.code] ?? (capabilityMap[row.code] = {}),
                {
                    name: row.name, code: row.code, type: type,
                    href: buildHREF(`${type === 'TechnicalCapability' ? TC_LIST_RESOURCE : CAPABILITY_LIST_RESOURCE}/${row.code}`)
                })
            if (!row.parent_code)
                continue;
            const parent = capabilityMap[row.parent_code] ?? (capabilityMap[row.parent_code] = {});
            (parent.children ?? (parent.children = [])).push(capability);
        }

        return capabilityMap["GRP.000"] ?? {};
    }
    async getE2EParticipition(systemCode) {
        return (await systemsRepository.selectSystemE2EParticipition(systemCode))
            .map(r => new E2EProcessContext(r));
    }

    /**
     * 
     * @param {SysemAssessmentStatus} assessmentStatus 
     */
    async addAssessmentStatus(systemCode, assessmentStatus) {
        await ArchMetricsRepository.upsertSystemAssessment(
            systemCode,
            assessmentStatus.fitness_function_code,
            assessmentStatus.assessment_date ?? Date(),
            assessmentStatus.assessment_description,
            assessmentStatus.status,
            assessmentStatus.result_details);

        await ptrArtifactsRepositoryInstance.setAssessmentResult(
            systemCode,
            assessmentStatus.fitness_function_code,
            assessmentStatus.status == 0 ? assessmentStatus.result_details : null,
            assessmentStatus.assessment_date ?? Date());

        return { message: "Архитектурная оценка добавлена" };
    }
    /**
    * 
    * @param {SysemAssessmentStatus} assessmentStatus 
    */
    async getSystemAssessments(systemCode) {
        return (await ArchMetricsRepository.selectSystemAssessments(systemCode)).map(a => new SysemAssessmentStatus(a));
    }

    async getApiMonitoring(systemCode) {
        const { c4Rows, providedRows } = await monitoringRepository.selectApiSources(systemCode);

        if (!c4Rows.length && !providedRows.length) return { containers: [], providedAPIs: [] };

        const apps = {};
        for (const row of c4Rows) {
            /**
             * @type {SystemApiMonitoring}
             */
            const app = apps[row.app_code] ?? (apps[row.app_code] =
                { systemCode: row.app_code, source: row.app_metric_template, containers: [] });

            if (row.container_code) {
                /**
                 * @type {ContainerApiMonitoring}
                 */
                let container = app.containers.find(c => c.code == row.container_code);
                if (!container) {
                    app.containers.push(container = {
                        code: row.container_code,
                        name: row.container_name,
                        source: row.container_metric_template,
                        interfaces: []
                    });
                }

                if (row.api_code) {
                    container.interfaces.push({ code: row.api_code, name: row.api_name, source: row.api_source });
                }
            }
        }
        const ret = (apps[systemCode] ?? { systemCode: systemCode })
        ret.providedAPIs = providedRows;

        return ret;
    }

    async setAppMonitoringTemplate(systemCode, appMetricTemplate) {
        return systemsRepository.setSystemTag(systemCode, API_METRIC_TEMPLATE_TAG, appMetricTemplate);
    }
}

export default new SystemService();