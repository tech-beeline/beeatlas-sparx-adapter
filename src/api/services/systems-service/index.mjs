import {
    BadRequest,
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
    SysemAssessmentStatus
} from "../../model/system.mjs";

import {
    ArchMetricsRepository,
    InterfacesRepository,
    MonitoringRepository,
    PtrArtifactsRepository,
    SystemsRepository,
    TechnicalCapabilitiesRepository
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
import { diffContainers } from "./containers/diff.mjs";

export { CONTAINERS_LEVEL, INTERFACES_LEVEL, METHODS_LEVEL, SYSTEM_LEVEL };

import GetAllSystems from "./get-all-systems.mjs";
import GetSystemByCode from "./get-system-by-code.mjs";
import { SystemContainerService } from './containers/index.mjs'
import { runSystemContext } from "../../repositories/systems-repository/system-package.mjs";
import { logErrorPutSystem, logSuccessPutSystem } from "./log/index.mjs";


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
const tcRepository = new TechnicalCapabilitiesRepository();

/**
 * 
 * @param {Container} a 
 * @param {Container} b 
 */
const isContainersEquals = (a, b) => a.name === b.name && a.status === b.status && a.version === b.version
const checkTC = async (code, context) => {
    const tc = await tcRepository.selectTCByCode(code);
    if (!tc.length) throw Error(`TC с кодом [${code}] не найден. ${context ?? ""} `);
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
     * @param {{ level:"systems"|"containers"| "interfaces"|"methods"}} options 
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
    }

    async getSystemContainers(systemCode) {
        return systemsRepository.selectSystemContainers(systemCode)
            .then(rows => rows.map(row => new Container(row)));
    }


    /**
     * 
     * @param {Container[]} targetContainers 
     * @param {Container[]} currentContainers 
     */
    async prepareContainersMethods(targetContainers, currentContainers) {
        const preparedContainers = [];
        for (const c of targetContainers) {
            if (!c.code) {
                throw BadRequest(`Не задан код контейнера "${c.name}"`)
            }
            const container = { ...c }
            const currentContainer = currentContainers.find(cc => cc.code?.toLowerCase() === container.code.toLowerCase());
            container.interfaces = [];
            const currentInterfaces = currentContainer?.interfaces ?? [];
            preparedContainers.push(container);
            for (const it of c.interfaces ?? []) {
                if (!it.code) {
                    throw BadRequest(`Не указан код интерфейса "${it.name} (контейнер "${c.name}", code=[${c.code}])"`);
                }

                const api = { ...it };
                const currentAPI = currentInterfaces.find(cit => cit.code?.toLowerCase() === api.code.toLowerCase());
                if (api.implements && api.implements !== currentAPI.implements) {
                    await checkTC(api.implements, `Интерфейс [${api.code}] "${api.name}"`);;
                }

                container.interfaces.push(api);
                api.methods = [];
                const currentMethods = currentAPI?.methods ?? [];

                if ((it.methods ?? []).length) {
                    const methodsMap = {};
                    for (const m of it.methods) {
                        const matched = m.name.match(/^(?<method>(get)|(post)|(put)|(delete)|(patch))\s+(?<endpoint>.*)/i)
                        if (matched) {
                            m.name = `${matched.groups?.method.toUpperCase()} ${matched.groups?.endpoint.toLowerCase()}`
                        }
                        /**@type {APIMethod} */
                        let method = methodsMap[m.name];
                        if (method) {
                            console.warn(`Обнаружен дубль метода ${m.name}`);
                            Object.assign(method, m);
                        }
                        if (!method) {
                            method = methodsMap[m.name] = { ...m };
                        }
                        const currentMethod = currentMethods.find(cm => cm.name.toLowerCase() == m.name.toLowerCase());
                        if (method.implements && currentMethod?.implements !== method.implements) {
                            await checkTC(method.implements, `Метод "${method.name}", интефрейс [${api.code}] "${api.name}"`);
                        }
                    }
                    api.methods = Object.values(methodsMap);
                }
            }
        }
        return preparedContainers;
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
            throw BadRequest(`Container ${JSON.stringify(containerWithoutCode)} has no code`);
        }
        const currentState = await this.getByCode(systemCode, { level: "methods" });
        if( isSystemEquals( currentState, system)){
            console.info( `Система [${systemCode}] "${system.name}" не требует обновления`);
            return currentState;
        }

        const containers = await this.prepareContainersMethods(system.containers ?? [], currentState.containers ?? []);

        try {
            await runSystemContext(systemCode, async () =>
                eaRepository.transactionScope(async () => {
                    const [newContainers, outdateContainers, existingContainers] = diffContainers(await systemsRepository.selectSystemContainers(systemCode), containers);

                    for (const c of newContainers) {
                        await systemsRepository.addSystemContainer(systemCode, c);
                    }

                    for (const c of outdateContainers) {
                        await systemsRepository.deleteSystemContainer(systemCode, c);
                    }

                    for (const diff of existingContainers) {
                        if (!isContainersEquals(diff.exists, diff.target)) {
                            await systemsRepository.updateContainer(diff.exists.container_id, diff.target.name, diff.target.code,
                                "FDM API", diff.target.version, diff.target.description, diff.target.status);
                        }
                        await interfacesRepository.updateContainerInterfaces(systemCode, diff.exists.container_id, diff.target.interfaces);
                    }
                }));
            const result = await this.getByCode(systemCode, { level: "methods" });
            await logSuccessPutSystem(systemCode, currentState, system, result);
            return result;
        } catch (err) {
            await logErrorPutSystem(systemCode, currentState, system, err);
            throw err;
        }
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
        await systemsRepository.setSystemTag(systemCode, API_METRIC_TEMPLATE_TAG, apiMetricTemplate);
        const result = await systemsRepository.getSystemTag(systemCode, API_METRIC_TEMPLATE_TAG);
        return { systemCode: systemCode, apiMetricTemplate: result?.value };
    }

    async getProvidedApi(systemCode) {
        const [methods, { providedRows }] = await Promise.all([
            systemsRepository.selectProvidedApi(systemCode),
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
}

export default new SystemService();