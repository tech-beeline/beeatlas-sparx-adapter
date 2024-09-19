import interfaceDataService from "../../data/interface-data-service/index.mjs";
import systemDataService from '../../data/systems-data-service/index.mjs'
import System, { Container } from "../../model/system.mjs";

export const GET_ALL_HANDLERS = {

    containers: async (addRemoved) => {
        const [systemsRows, containersRows] = await Promise.all([
            systemDataService.selectSystems(),
            systemDataService.selectSystemsContainers()
        ])
        const systemsMap = (addRemoved ? systemsRows : systemsRows.filter(c => c.status !== "REMOVED"))
            .reduce((acc, v) => (acc[v.code] = new System(v), acc), {});

        (addRemoved ? containersRows : containersRows.filter(c => c.status !== "REMOVED"))
            .forEach(row => {
                systemsMap[row.sys_code]?.addContainer(row);
            })
        return Object.values(systemsMap);
    },
    interfaces: async (addRemoved) => {
        const [systemsRows, containersRows, interfacesRows] = await Promise.all([
            systemDataService.selectSystems(),
            systemDataService.selectSystemsContainers(),
            interfaceDataService.selectAllContainersInterfaces()
        ])
        const systemsMap = (addRemoved ? systemsRows : systemsRows.filter(c => c.status !== "REMOVED"))
            .reduce((acc, v) => (acc[v.code] = new System(v), acc), {});

        const containersMap = {};

        (addRemoved ? containersRows : containersRows.filter(c => c.status !== "REMOVED"))
            .forEach(row => {
                systemsMap[row.sys_code]?.addContainer(containersMap[row.code] = new Container(row));
            });

        (addRemoved ? interfacesRows : interfacesRows.filter(c => c.status !== "REMOVED"))
            .forEach(row => {
                containersMap[row.container_code]?.addInterface(row);
            });
        return Object.values(systemsMap);
    },
    methods: async (addRemoved) => {
        NotImplemented();
    }
}
class GetAllSystems {
    async systems(addRemoved) {
        return systemDataService.selectSystems()
            .then(rows => rows.map(s => new System(s)))
    }
    async withContainers(addRemoved) {
        const [systemsRows, containersRows] = await Promise.all([
            systemDataService.selectSystems(),
            systemDataService.selectSystemsContainers()
        ])
        const systemsMap = (addRemoved ? systemsRows : systemsRows.filter(c => c.status !== "REMOVED"))
            .reduce((acc, v) => (acc[v.code] = new System(v), acc), {});

        const containersMap = {};

        (addRemoved ? containersRows : containersRows.filter(c => c.status !== "REMOVED"))
            .forEach(row => {
                systemsMap[row.sys_code]?.addContainer(containersMap[row.code] = new Container(row));
            });

        return { systems: Object.values(systemsMap), systemsMap: systemsMap, containersMap: containersMap };
    }
    async withInterfaces(addRemoved) {
        const [{ systems, systemsMap, containersMap }, interfacesRows] = await Promise.all([
            this.withContainers(addRemoved),
            interfaceDataService.selectAllContainersInterfaces()
        ]);
        const interfacesMap = {};
        (addRemoved ? interfacesRows : interfacesRows.filter(it => it.status !== "REMOVED"))
            .forEach(it => {
                interfacesMap[it.code] = containersMap[it.container_code]?.addInterface(it)
            })

        return { systems: systems, systemsMap: systemsMap, containersMap: containersMap, interfacesMap: interfacesMap };
    }
    async withMethods(addRemoved) {
        const [{ systems, systemsMap, interfacesMap }, methodsRows] = await Promise.all([
            this.withInterfaces(addRemoved),
            interfaceDataService.selectAllMethods()
        ])

        methodsRows.filter(m => m.interface_code).forEach(m => {
            interfacesMap[m.interface_code]?.addMethod(m)
        })
        return systems;
    }
}
export default new GetAllSystems();