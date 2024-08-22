import Capability, { CapabilityRef } from "../../api/model/capability.mjs";

class CAPABILITY_EXAMPLES {
    get RootDomain() {
        return  new Capability({
            "code": "GRP.000",
            "isDomain": true,
            "name": "Каталог Возможностей (Capability Catalog)",
            "description": "Общий каталог возможностей. Включает группы доменов и домены L2 ДМВ.",
            "author": "vkit",
            "status": "Proposed",
            "createdDate": "2021-04-15T21:00:00.000Z",
            "owner": ""
        })
    }
    get DomainGroup() {
        return  new Capability({
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
    }
    get Capability() {
        return  new Capability({
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
    }
    get ChildCapability() {
        return  new Capability({
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
    get DomainWithChildren() {
        return new Capability({
            "code": "GRP.000",
            "isDomain": true,
            "name": "Каталог Возможностей (Capability Catalog)",
            "description": "Общий каталог возможностей. Включает группы доменов и домены L2 ДМВ.",
            "author": "vkit",
            "status": "Proposed",
            "createdDate": "2021-04-15T21:00:00.000Z",
            "owner": "",
            children: [
                new Capability({
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
            ]
        })
    }
    get PutCapabilitySample() {
        return new Capability({
            isDomain: false, name: "Возможность посадить денежное дерево", description: `Пример для создания/изменения возможности.`, parent: "DMN.WONDERS", owner: "Карабас Барабас", author: "Алексей Толстой", status: "Черновик"
        })
    }
    get PutDomainSample() {
        return new Capability({
            isDomain: true, name: "Страна Дураков", description: "Пример для обновления возмжности", parent: "GRP.000", owner: "Карабас Барабас", author: "Алексей Толстой"
        })
    }
    get PutDomainSample2() {
        return new Capability({
            isDomain: true, name: "Поле Чудес", description: "Пример для обновления возмжности", parent: "DMN.FOOLS", owner: "Карабас Барабас", author: "Алексей Толстой"
        })
    }
}

export default new CAPABILITY_EXAMPLES();