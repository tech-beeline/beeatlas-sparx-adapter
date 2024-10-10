import { buildHREF } from "../../api/controllers/controller-decorator.mjs";
import { CAPABILITY_LIST_RESOURCE } from "../../api/specifications/paths.mjs";

export class CapabilityRef {
    domainCode;
    capabilitCode;
    href;
    constructor({ domainCode, capabilityCode }) {
        this.domainCode = domainCode ?? undefined;
        this.capabilitCode = capabilityCode ?? undefined;
    }
}
class Capability {
    code;
    /**
     * @type {boolean}
     */
    isDomain;
    name;
    description;
    author;
    createdDate;
    modifiedDate;
    status;
    parent;
    owner;
    children;
    ea_guid;
    self;
    constructor(cap) {
        for (const prop in this) {
            this[prop] = cap[prop] ?? undefined;
        }
        this.self = buildHREF(`${CAPABILITY_LIST_RESOURCE}/${this.code}`)

        this.getCapabilityId = () => cap.id;
        this.getPackageId = () => cap.package_id
    }
}


export const CAPABILITY_EXAMPLES = {
    RootDomain: new Capability({
        "code": "GRP.000",
        "isDomain": true,
        "name": "Каталог Возможностей (Capability Catalog)",
        "description": "Общий каталог возможностей. Включает группы доменов и домены L2 ДМВ.",
        "author": "vkit",
        "status": "Proposed",
        "createdDate": "2021-04-15T21:00:00.000Z",
        "owner": ""
    })
    ,
    DomainGroup: new Capability({
        "code": "GRP.010",
        "isDomain": true,
        "name": "Управление ИТ",
        "description": null,
        "author": "vkit",
        "status": "Proposed",
        "createdDate": "2021-04-15T21:00:00.000Z",
        "owner": "",
        "parent": "GRP.000"
    })
    ,
    Capability: new Capability({
        "code": "BC-000134",
        "isDomain": false,
        "name": "Возможность спроектировать и разработать функциональные Capability готовые к изоляции и управляемой интеграции ",
        "description": "Возможность спроектировать и разработать функциональные Capability готовые к изоляции и управляемой интеграции ",
        "author": "AKashkarov",
        "status": "Identified",
        "createdDate": "2021-06-30T13:18:02.000Z",
        "owner": "Хайдаров И.Н.",
        "parent": "DMN.103"
    })
    ,
    ChildCapability: new Capability({
        "code": "BC-014056",
        "isDomain": false,
        "name": "Создание запроса на внесение изменений на ИТ-ландшафт",
        "description": "Возможность создать запрос на внесение изменений на ИТ-ландшафт",
        "author": "Александр Кашкаров",
        "status": "Proposed",
        "createdDate": "2023-09-05T11:00:24.000Z",
        "owner": "",
        "parent": "BC-014055"
    })

}
export default Capability;