import Capability, { CapabilityRef } from "../../model/capability.mjs";

const CAPABILITY_EXAMPLES = {
    RootDomain: new Capability({
        "code": "GRP.000",
        "isDomain": true,
        "name": "Каталог Возможностей (Capability Catalog)",
        "description": "Общий каталог возможностей. Включает группы доменов и домены L2 ДМВ.",
        "author": "vkit",
        "status": "Proposed",
        "createdDate": "2021-04-15T21:00:00.000Z",
        "owner": ""
    }),
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
    }),
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
    }),
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
    }),
    DomainWithChildren: new Capability({
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
    }),
    PutCapabilitySample: new Capability({
        isDomain : false, name: "Возможность посадить денежное дерево", description : `Пример для создания/изменения возможности.`, parent: "DMN.WONDERS", owner : "Карабас Барабас", author : "Алексей Толстой", status: "Черновик"
    }),
    PutDomainSample: new Capability({
        isDomain : true, name: "Страна Дураков", description : "Пример для обновления возмжности", parent: "GRP.000", owner : "Карабас Барабас", author : "Алексей Толстой"
    }),
    PutDomainSample2: new Capability({
        isDomain : true, name: "Поле Чудес", description : "Пример для обновления возмжности", parent: "DMN.FOOLS", owner : "Карабас Барабас", author : "Алексей Толстой"
    })
}

export default CAPABILITY_EXAMPLES;