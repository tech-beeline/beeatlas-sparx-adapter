import { buildHREF } from "../controllers/controller-decorator.mjs";
import { integerProperty, schemasRef, stringProperty } from "../specifications/helpers.mjs";
import { E2E_LIST_RESOURCE, SYSTEM_LIST_RESOURCE } from "../specifications/paths.mjs";

export class APIMethodParameter {
    name;
    type;
    description;
    constructor({ name, type, description } = {}) {
        this.name = name;
        this.type = type;
        this.description = description;
    }
}

export class APIMethod {
    /** @type {string} */
    name;
    returnType;
    /** @type {string} */
    description;
    rps;
    latency;
    error_rate;
    /** @type {string} */
    implements;

    constructor({ name, returnType, description, parameters, notes, ea_guid, operationid, rps, latency, error_rate, implements: tcCode } = {}) {
        this.name = name;
        this.returnType = returnType ?? undefined;
        this.description = description ?? notes;
        this.rps = rps ?? undefined;
        this.latency = latency ?? undefined;
        this.error_rate = error_rate ?? undefined;
        this.implements = tcCode ?? undefined;
        //this.parameters = parameters ? parameters.map(p => p instanceof APIMethodParameter ? p : new APIMethodParameter(p)) : [];
    }
}

const compareMethods = (a, b) => a.name.localeCompare(b.name)

export class APIInterface {
    name;
    code;
    version;
    type;
    specification;
    implements;
    description;
    status;
    protocol;
    /**
     * @type {APIMethod[]}
     */
    methods = [];
    constructor({ name, code, version, type, specification, tcCode, methods, description, i_id, protocol, status } = {}) {
        this.name = name;
        this.code = code;
        this.version = version;
        this.type = type;
        this.specification = specification ?? undefined;
        this.implements = tcCode ?? undefined;
        this.description = description ?? undefined;
        this.methods = methods ?? [];
        this.protocol = protocol ?? undefined;
        this.status = status;

        this.ea_id = () => i_id;
    }
    /**
     * 
     * @param {*} uid 
     * @returns {APIMethod}
     */
    methodByUID(uid) {
        return this.methods?.find(m => m.ea_guid() === uid);
    }
    addMethod(method) {
        this.methods.push(new APIMethod(method));
        this.methods = this.methods.sort(compareMethods);
    }
}
export class Container {
    name;
    /** @type {string} */
    code;
    version;
    tags;
    status;
    description;
    /**
     * @type {APIInterface[]}
     */
    interfaces;
    constructor({ name, code, version, tags, interfaces, description, status } = {}) {
        this.name = name;
        this.code = code;
        this.version = version || undefined;
        this.tags = tags;
        this.interfaces = interfaces;
        this.status = status || undefined;
        this.description = description ?? undefined;
    }
    addInterface(i) {
        if (!(i instanceof APIInterface)) i = new APIInterface(i)
        if (!this.interfaces) this.interfaces = [];
        this.interfaces.push(i);
        return i;
    }
    interfaceByCode(code) {
        return this.interfaces?.find(i => i.code === code);
    }
}

export class E2EProcessContext {
    process;
    bi;
    diagram;
    seqno;
    message;
    system;

    constructor(obj = {}) {
        this.process = {
            name: obj.process,
            uid: obj.process_uid,
            href: buildHREF(`${E2E_LIST_RESOURCE}/${encodeURIComponent(obj.process_uid)}`)
        }
        this.bi = {
            name: obj.bi_name,
            uid: obj.bi_uid,
            href: buildHREF(`TBD`) // [ ] добавить сылку на сценарий BI
        }
        this.diagram = {
            name: obj.diagram,
            uid: obj.diagram_uid
        }
        this.message = {
            seqno: obj.seqno,
            name: obj.message,
            operation: obj.operation_guid && obj.operation ? {
                name: obj.operation,
                uid: obj.operation_guid,
                interface: {
                    name: obj.interface,
                    uid: obj.interface_uid,
                    href: "TBD"
                },
                href: "TBD"
            } : undefined
        }
        this.system = {
            name: obj.sys_name,
            code: obj.sys_code,
            href: buildHREF(`${SYSTEM_LIST_RESOURCE}/${encodeURIComponent(obj.sys_code)}`)
        }
    }
}


export class SystemE2EParticipition {
    /** @type {ProcessRef} */
    process;
    /** @type {MethodRef} */
    method;
    constructor(processRef, methodRef) {
        this.process = processRef;
        this.method = methodRef;
    }
}

const SYSTEM_PURPOSE_EXAMPLE = {
    "name": "Каталог Возможностей (Capability Catalog)",
    "code": "GRP.000",
    "type": "Domain",
    "href": "https://company/api/v4/capabilities/GRP.000",
    "children": [
        {
            "name": "Сервисы ИТ-ландшафта ВК",
            "code": "GRP.011",
            "type": "Domain",
            "href": "https://company/api/v4/capabilities/GRP.011",
            "children": [
                {
                    "name": "Сервисы производства",
                    "code": "GRP.012",
                    "type": "Domain",
                    "href": "https://company/api/v4/capabilities/GRP.012",
                    "children": [
                        {
                            "name": "Проектирование технического решения ИТ-продукта",
                            "code": "DMN.153",
                            "type": "Domain",
                            "href": "https://company/api/v4/capabilities/DMN.153",
                            "children": [
                                {
                                    "name": "Высокоуровневое проектирование продукта",
                                    "code": "BC-018364",
                                    "type": "Capability",
                                    "href": "https://company/api/v4/capabilities/BC-018364",
                                    "children": [
                                        {
                                            "name": "Возможность заведения новой технической возможности",
                                            "code": "FDMSHOWCASEAPP.0003",
                                            "type": "TechnicalCapability",
                                            "href": "https://company/api/v4/tc/FDMSHOWCASEAPP.0003"
                                        },
                                        {
                                            "name": "Возможность получения данных о business capability",
                                            "code": "FDMSHOWCASEAPP.001",
                                            "type": "TechnicalCapability",
                                            "href": "https://company/api/v4/tc/FDMSHOWCASEAPP.001"
                                        }
                                    ]
                                },
                                {
                                    "name": "Детальное проектирование продукта",
                                    "code": "BC-018365",
                                    "type": "Capability",
                                    "href": "https://company/api/v4/capabilities/BC-018365",
                                    "children": [
                                        {
                                            "name": "Возможность заведения новой технолгии в технорадаре",
                                            "code": "FDMSHOWCASEAPP.002",
                                            "type": "TechnicalCapability",
                                            "href": "https://company/api/v4/tc/FDMSHOWCASEAPP.002"
                                        }
                                    ]
                                },
                                {
                                    "name": "Позиционирование продукта на карте бизнес-возможностей",
                                    "code": "BC-018367",
                                    "type": "Capability",
                                    "href": "https://company/api/v4/capabilities/BC-018367",
                                    "children": [
                                        {
                                            "name": "Получение перечня бизнес-возможностей",
                                            "code": "BC-018369",
                                            "type": "TechnicalCapability",
                                            "href": "https://company/api/v4/tc/BC-018369"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "name": "Управление ИТ",
            "code": "GRP.010",
            "type": "Domain",
            "href": "https://company/api/v4/capabilities/GRP.010",
            "children": [
                {
                    "name": "Управление знаниями в ИТ",
                    "code": "DMN.109",
                    "type": "Domain",
                    "href": "https://company/api/v4/capabilities/DMN.109",
                    "children": [
                        {
                            "name": "Возможность моделирования предметных областей на основе общих моделей на уровне домена и ИТ-ландшафта",
                            "code": "BC-000137",
                            "type": "Capability",
                            "href": "https://company/api/v4/capabilities/BC-000137",
                            "children": [
                                {
                                    "name": "Тестовая ТС",
                                    "code": "TC-SAMPLE-CODE",
                                    "type": "TechnicalCapability",
                                    "href": "https://company/api/v4/tc/TC-SAMPLE-CODE"
                                }
                            ]
                        },
                        {
                            "name": "Возможность управления и использования общекорпоративного глоссария",
                            "code": "BC-000135",
                            "type": "Capability",
                            "href": "https://company/api/v4/capabilities/BC-000135",
                            "children": [
                                {
                                    "name": "Тестовая ТС",
                                    "code": "TC-SAMPLE-CODE",
                                    "type": "TechnicalCapability",
                                    "href": "https://company/api/v4/tc/TC-SAMPLE-CODE"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}

export const SYSTEM_PURPOSE_SCHEMA = {
    type: "object",
    properties: {
        name: stringProperty("Название возможности", "Каталог Возможностей (Capability Catalog)"),
        name: stringProperty("Код возможности", "Каталог Возможностей (Capability Catalog)"),
        type: stringProperty("Тип возможности (Domain,Capability,TechnicalCapability)"),
        children: {
            type: "array",
            description: "Дочерние возможности, в которых участвтует техническая возможность, приндалежэащая системе",
            items: {
                type: "object",
                schema: { $ref: "#/components/schemas/SystemPuprose" }
            }
        },
        href: stringProperty("Ссылка на описание возможности", { example: "https://company/api/entity/XXX" })
    },
    example: SYSTEM_PURPOSE_EXAMPLE
}

export default class System {
    name;
    /**
     * @type {string}
     */
    code;
    version;
    package;
    tags;
    author;
    description;
    ea_guid;
    FQName;
    status;
    modifiedDate;
    /**
     * @type {Container[]}
     */
    containers = [];
    links = {};

    constructor({ name, code, version, tags, containers, author, description, ea_guid, FQName, packageName, status, modifiedDate } = {}) {
        this.name = name;
        this.code = code;
        this.version = version;
        this.tags = tags;
        this.containers = containers ?? this.containers;
        this.author = author;
        this.description = description ?? undefined;
        this.ea_guid = ea_guid;
        this.FQName = FQName;
        this.package = packageName;
        this.status = status;
        this.modifiedDate = modifiedDate;
        this.links = {
            self: buildHREF(`${SYSTEM_LIST_RESOURCE}/${encodeURIComponent(code)}`),
            purpose: buildHREF(`${SYSTEM_LIST_RESOURCE}/${encodeURIComponent(code)}/purpose`),
            e2e: buildHREF(`${SYSTEM_LIST_RESOURCE}/${encodeURIComponent(code)}/e2e`),
            assessments: buildHREF(`${SYSTEM_LIST_RESOURCE}/${encodeURIComponent(code)}/e2e`)
        }
    }
    /**
     * 
     * @param {{name: String, code:String, version:String, interfaces: Array<{name, code, version}>}} container 
     * @returns 
     */
    addContainer(container) {
        if (!(container instanceof Container)) container = new Container(container);
        if (!this.containers) this.containers = [];
        return (this.containers.find(c => c.code?.toLowerCase() === container.code?.toLowerCase()))
            || (this.containers.push(container), container);
    }
    containerByCode(code) {
        return this.containers?.find(c => c.code?.toLowerCase() === code?.toLowerCase());
    }
}

/**
 * Результаты архитектурной оценки системы
 */
export class SysemAssessmentStatus {
    /**
     * @description Код системы (CMDN мнемоника)
     * @type {string}
     */
    system_code;
    fitness_function_code;
    assessment_date;
    assessment_description;
    status;
    result_details;
    constructor(obj) {
        this.system_code = obj.system_code;
        this.fitness_function_code = obj.fitness_fn_code;
        this.assessment_date = obj.assessment_date;
        this.assessment_description = obj.assessment_description;
        this.status = obj.assessment_status;
        this.result_details = obj.result_details;
    }
}

export const SYSTEM_ASSESSMENT_RESULT_SCHEMA = {
    type: "object",
    properties: {
        system_code: stringProperty("Код системы (CMDB мнемоника)", { example: "FDMSHOWCASEAPP" }),
        fitness_function_code: stringProperty("Код выполенной проверки", { example: "TEST-FUNC" }),
        assessment_date: stringProperty("Время проверки", { example: Date() }),
        assessment_description: stringProperty("Описание проведенной проверки", { example: "Тестовая проверка для тестирования тестирования" }),
        status: integerProperty("Статус проверки (0- проверка прошла успешно)", { example: 1 }),
        result_details: stringProperty("Детальное описание  результатов проверки", { example: "У нас все хорошо" })
    }
}

export const SYSTEM_MONITORING_RESULT_SCHEMA = {
    type: "object",
    properties: {
        system_code: stringProperty("Код системы (CMDB мнемоника)", { example: "FDMSHOWCASEAPP" })
    }
}

export const isContainersEquals = (a, b) =>
    a.name === b.name
    && (a.description ?? "") === (b.description ?? "")
    && (a.status ?? "") === (b.status ?? "")
    && (a.version ?? "") === (b.version ?? "")
    && a.code === b.code
    && (a.author ?? "") === (b.author ?? "");

export const isAPIEquals = (a, b) => a.name === b.name
    && (a.description ?? "") === (b.description ?? "")
    && (a.version ?? "") === (b.version ?? "")
    && (a.status ?? "") === (b.status ?? "")
    && (a.specification ?? "") === (b.specification ?? "")
    && (a.implements ?? "") === (b.implements ?? "")
    && a.code === b.code;

const codeCompare = (a, b) => a.code.toLowerCase().localeCompare(b.code.toLowerCase());
const nameCompare = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase());

export const isMethodEquals = (a, b) =>
    a.name === b.name && (a.description ?? "") === (b.description ?? "")
    && (a.rps?.toString() ?? "") === (b.rps?.toString() ?? "")
    && (a.latency?.toString() ?? "") === (b.latency?.toString() ?? "")
    && (a.error_rate?.toString() ?? "") === (b.error_rate?.toString() ?? "")
    && (a.implements?.toString() ?? "") === (b.implements?.toString() ?? "");
/**
 * 
 * @param {System} aSystem 
 * @param {System} bSystem 
 */
export const isSystemEquals = (aSystem, bSystem) => {
    const aContainers = [...aSystem.containers ?? []].sort(codeCompare);
    const bContainers = [...bSystem.containers ?? []].sort(codeCompare);
    if (aContainers.length !== bContainers.length) return false;
    for (let i = 0; i < aContainers.length; i++) {
        if (aContainers[i].code.toLowerCase() !== bContainers[i].code.toLowerCase() || !isContainersEquals(aContainers[i], bContainers[i]))
            return false;
        const aInterfaces = [...aContainers[i].interfaces ?? []].sort(codeCompare);
        const bInterfaces = [...bContainers[i].interfaces ?? []].sort(codeCompare);
        if (aInterfaces.length !== bInterfaces.length)
            return false;
        for (let j = 0; j < aInterfaces.length; j++) {
            const aApi = aInterfaces[j];
            const bApi = bInterfaces[j];
            if (aApi.code?.toLowerCase() !== bApi.code?.toLowerCase() || !isAPIEquals(aApi, bApi))
                return false;
            const aMethods = [...aApi.methods ?? []].sort(nameCompare);
            const bMethods = [...bApi.methods ?? []].sort(nameCompare);
            if (aMethods.length !== bMethods.length)
                return false;
            for (let k = 0; k < aMethods.length; k++) {
                if (!isMethodEquals(aMethods[k], bMethods[k]))
                    return false;
            }
        }
    }
    return true;
}