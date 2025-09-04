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
    isContainersEquals,
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
    async prepareContainersMethods(systemCode, targetContainers, currentContainers) {
        const preparedContainers = [];
        for (const c of targetContainers) {
            if (!c.code) {
                throw BadRequest(`Не задан код контейнера "${c.name}"`)
            }
            c.code = c.code.toLowerCase();
            if (!c.code.endsWith(systemCode.toLowerCase())) {
                throw BadRequest(`Полный код контейнера должен иметь вид <код контейнера внутри системы>.<код системы>. Код контейнера="${c.code}", код системы="${systemCode}"`);
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
                it.code = it.code.toLowerCase();

                if (!it.code.endsWith(c.code)) {
                    throw BadRequest(`Полный код интерфейса должен иметь вид <код интерфейса внутри контейнера>.<код контейнера>. Код интерфейса="${it.code}", код системы="${c.code}"`);
                }

                const api = { ...it };
                const currentAPI = currentInterfaces.find(cit => cit.code?.toLowerCase() === api.code.toLowerCase());
                if (api.implements && api.implements !== currentAPI?.implements) {
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
                        const protocol = it.protocol?.toLowerCase();
                        if (protocol == "soap" || protocol == "grpc") {
                            const t = m.name.split(".");
                            if (t.length > 1) {
                                t.shift();
                                m.name = t.join(".");
                            }
                        }
                        /**@type {APIMethod} */
                        let method = methodsMap[m.name];
                        if (method) {
                            console.warn(`Обнаружен дубль метода ${m.name} интерфейс [${it.code}] ${it.name}`);
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
     * @param {Container} container 
     */
    async repairMultipleContainers(container) {
        for( const c of container.current){
            
        }
    }

    async #updateSystemContainers(systemCode, containers) {
        const container_map = {};
        systemCode = systemCode.toLowerCase();
        for (const container of containers) {
            container.code = container.code.toLowerCase();
            if (container_map[container.code]) throw Error(`В запросе более одного контейнера с кодом ${container.code}`);
            container.current = [];
            container_map[container.code] = container;
        }
        const current_containers = await systemsRepository.selectSystemContainers(systemCode);
        for (const current_container of current_containers) {
            current_container.code = current_container.code.toLowerCase();
            const container = container_map[current_container.code] ?? { current: [], needDelete: true };
            container.current.push(current_container);
        }

        for (const container_code in container_map) {
            /** @type {Container} */
            const container = container_map[container_code];
            if (container.needDelete) {
                for (const c of container.current) {
                    console.log(`Удаление контейнера с кодом ${container_code}, object_id=${c.container_id}`);
                    await systemsRepository.deleteSystemContainer(systemCode, { containerCode: c.code, container_id: c.container_id });
                }
                continue;
            }
            if (container.current.length == 0) {
                console.log(`Добавление нового контейнера с кодом ${container_code}`);
                await systemsRepository.insertSystemContainer(container);
            }
            if (container.current.length == 1) {
                container.container_id = container.current[0].container_id;
                if (!isContainersEquals(container, container.current[0])) {
                    console.log(`Обновление информации о контейнере с кодом ${container_code}`);
                    await systemsRepository.updateContainer(
                        container.container_id,
                        container.name,
                        container.code,
                        container.author,
                        container.version,
                        container.description,
                        container.status);
                } else {
                    console.log(`Обновление контейнера с кодом ${container_code} не треубется`);
                }
            }
            if (container.current.length > 1) {
                console.warn(`В репозитории найдено несколько (${container.current.length}) контейнеров с кодом ${container_code}`);
                await this.repairMultipleContainers(container);
            }
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
            throw BadRequest(`Container ${JSON.stringify(containerWithoutCode)} has no code`);
        }
        const currentState = await this.getByCode(systemCode, { level: "methods" });

        const containers = await this.prepareContainersMethods(system.code, system.containers ?? [], currentState.containers ?? []);

        if (isSystemEquals(currentState, system)) {
            console.info(`Система [${systemCode}] "${system.name}" не требует обновления`);
            return currentState;
        }

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
            console.log(`Обновление системы с кодом = ${systemCode} завершено`);
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