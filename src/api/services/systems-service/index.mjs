import {
    BadRequest,
    NotFound,
    NotImplemented
} from "../../../utils/errors.mjs";
import { API_METRIC_TEMPLATE_TAG } from "../../const.mjs";
import { buildHREF } from "../../controllers/controller-decorator.mjs";
import SystemApiMonitoring, { ContainerApiMonitoring } from "../../model/observability/system-api-monitoring.mjs";

import System, {
    APIMethod,
    Container,
    E2EProcessContext,
    isSystemEquals,
    isContainersEquals,
    SysemAssessmentStatus,
    APIInterface
} from "../../model/system.mjs";

import {
    appRepository,
    ArchMetricsRepository,
    interfaceRepository,
    methodRepository,
    MonitoringRepository,
    PtrArtifactsRepository,
    tcRepository
} from "../../repositories/index.mjs";
import eaRepository from "../../repositories/sparx-ea-repository/ea-repository.mjs";
import {
    CAPABILITY_LIST_RESOURCE,
    TC_LIST_RESOURCE
} from "../../specifications/paths.mjs";
import {
    CONTAINERS_LEVEL,
    INTERFACES_LEVEL,
    METHODS_LEVEL,
    SYSTEM_LEVEL
} from "./const.mjs";
import {
    compareContainers
} from "./containers/compare.mjs";

export { CONTAINERS_LEVEL, INTERFACES_LEVEL, METHODS_LEVEL, SYSTEM_LEVEL };

import { runSystemContext } from "../../repositories/systems-repository/system-package.mjs";
import { logErrorPutSystem, logSuccessPutSystem } from "./log/index.mjs";
import { containerRepository } from "../../repositories/systems-repository/container-repository.mjs";
import { REMOVED_STATUS } from "../../repositories/systems-repository/const.mjs";
import { validatePutData as validatePutInformation } from "./validate.mjs";
import { SystemDTOInternal } from "../../repositories/systems-repository/model.mjs";
import { getContainers } from "./containers/build-system.mjs";
import { prepareSystemPackages } from "../../repositories/systems-repository/app-repository.mjs";
import { putContainer, putContainerInterfaces } from "./containers/put-container.mjs";
import { loadApp } from "../../repositories/systems-repository/queries/select-systems.mjs";
import { removeContainer } from "./containers/remove-container.mjs";
import { selectSystemChangeByChangeId, selectSystemChanges } from "../../repositories/arch-metrics-repository/queries.mjs";


const STEREOTYPE_MAP = {
    ArchiMate_TechnicalCapability: "TechnicalCapability",
    ArchiMate_Capability: "Capability",
    Package: "Domain",
    Domain: "Domain"
}

const ptrArtifactsRepositoryInstance = new PtrArtifactsRepository();
const monitoringRepository = new MonitoringRepository();

const checkTC = async (code, context) => {
    const tc = await tcRepository.byCode(code);
    if (!tc) throw Error(`TC с кодом [${code}] не найден. ${context ?? ""} `);
}


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
        const systems = await appRepository.selectSystems();
        return systems.map(s => new System({ ...s, containers: getContainers(s, level) }));
    }

    async getInterfaceMethods(interfaceCode, level, addRemoved) {
        let methods = await methodRepository.byInterfaceCode(interfaceCode);
        if (!addRemoved) methods = (await methods).filter(m => !m.removed_date);
        methods = methods.map(m => new APIMethod(m));
        return methods;
    }

    async getContainerInterfaces(containerCode, level, addRemoved) {
        let interfaces = await interfaceRepository.selectContainerInterfaces(containerCode);

        if (!addRemoved) interfaces = interfaces.filter(i => i.status != REMOVED_STATUS);
        interfaces = interfaces.map(i => new APIInterface(i));

        if (level === METHODS_LEVEL) {
            for (const it of interfaces) {
                it.methods = await this.getInterfaceMethods(it.code, level, addRemoved);
            }
        }
        return interfaces;
    }
    /**
     * 
     * @param {string} systemCode 
     * @param {string} level 
     * @param {string} addRemoved 
     */
    async getSystemContainers(systemCode, level, addRemoved) {
        let containers = await containerRepository.bySystemCode(systemCode);

        if (!addRemoved) containers = containers.filter(c => c.status !== REMOVED_STATUS);
        containers = containers.map(c => new Container(c));

        if (level != CONTAINERS_LEVEL) {
            for (const c of containers) {
                c.interfaces = await this.getContainerInterfaces(c.code, level, addRemoved);
            }
        }
        return containers;
    }

    /**
     * 
     * @param {string} code 
     * @param {{ level:"systems"|"containers"| "interfaces"|"methods", addRemoved:boolean}} options 
     * @returns {Promise<System>}
     */
    async getByCode(code, options = {}) {
        const { level = SYSTEM_LEVEL, addRemoved } = options;

        const sys_entity = await appRepository.byCode(code);
        if (!sys_entity) throw NotFound(`System with code = ${code} was not found`);

        const system = new System(sys_entity);

        system.containers = getContainers(sys_entity, level)

        return system;
    }

    /**
     * 
     * @param {string} systemCode 
     * @param {System} system 
     */
    async putSystem(systemCode, system) {
        await validatePutInformation(systemCode, system);

        const current_state = await this.getByCode(systemCode, { level: "methods", addRemoved: true });
        if (!current_state) {
            throw NotFound(`Система с кодом ${systemCode} не найдена`);
        }

        if (!current_state.hasDoubles() && isSystemEquals(current_state, system)) {
            console.info(`Система [${systemCode}] "${system.name}" не требует обновления`);
            return current_state;
        }

        const pkg = await prepareSystemPackages(systemCode);

        try {
            await eaRepository.transactionScope(async () => {

                const app = await appRepository.byCode(systemCode);

                if (!system.containers)
                    system.containers = [];

                for (const code in app.containers ?? {}) {
                    const ec = system.containers.find(c => c.code.toLowerCase() === code.toLowerCase());
                    if (ec || (app.containers[code].status || app.containers[code].container_status) === REMOVED_STATUS)
                        continue;
                    await removeContainer(app, app.containers[code]);
                }


                for (const container of system.containers) {
                    console.log(`Добавление/изменение контейнера ${container.code}`);
                    container.code = container.code.toLowerCase();

                    await putContainer(app, container);
                }

                await loadApp(app);
            });


            const result = await this.getByCode(systemCode, { level: "methods" });
            console.log(`Обновление системы с кодом = ${systemCode} завершено`);
            await logSuccessPutSystem(systemCode, current_state, system, result);
            return result;
        } catch (err) {
            await logErrorPutSystem(systemCode, current_state, system, err);
            throw err;
        }
    }

    async getPurpose(systemCode) {
        const rows = await appRepository.selectSystemCapabilities(systemCode);

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
        return (await appRepository.selectSystemE2EParticipition(systemCode))
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
            const app = apps[row.app_code.toLowerCase()] ?? (apps[row.app_code.toLowerCase()] =
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
                    container.interfaces.push({ code: row.api_code, name: row.api_name, source: row.api_metric_template });
                }
            }
        }
        const ret = (apps[systemCode.toLowerCase()] ?? { systemCode: systemCode })
        ret.providedAPIs = providedRows;

        return ret;
    }

    /**
     * 
     * @param {string} systemCode 
     * @param {string} apiMetricTemplate 
     * @returns {Promise<{systemCode,apiMetricTemplate }>}
     */
    async setAppMonitoringTemplate(systemCode, apiMetricTemplate) {
        await appRepository.setSystemTag(systemCode, API_METRIC_TEMPLATE_TAG, apiMetricTemplate);
        const result = await appRepository.getSystemTag(systemCode, API_METRIC_TEMPLATE_TAG);
        return { systemCode: systemCode, apiMetricTemplate: result?.value };
    }

    async getProvidedApi(systemCode) {
        const [methods, { providedRows }] = await Promise.all([
            appRepository.selectProvidedApi(systemCode),
            monitoringRepository.selectApiSources(systemCode)
        ]);
        const apiMap = providedRows.reduce((map, s) => (map[s.ea_guid] = { ...s, methods: [] }, map), {})
        for (const m of methods) {
            const api = apiMap[m.ea_guid];
            if (!api) throw Error('Hmmmm api not found?');
            api.code = api.code ?? undefined;
            api.api_metric_template = api.api_metric_template ?? undefined;
            api.methods.push({
                name: m.method_name,
                description: m.method_description ?? undefined,
                rps: m.rps ?? undefined,
                latency: m.latency ?? undefined,
                error_rate: m.error_rate ?? undefined
            });
        }
        return Object.values(apiMap);
    }
    async getChanges(code, count = 100, from_id) {
        return selectSystemChanges(code);
    }
    async getChangeDetails(id) {
        return selectSystemChangeByChangeId(id);
    }
}

export default new SystemService();