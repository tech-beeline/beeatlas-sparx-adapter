import { NotFound } from "../../../utils/errors.mjs";
import interfaceDataService from "../../data/interface-data-service/index.mjs";
import systemDataService from '../../data/systems-data-service/index.mjs'
import System, { Container } from "../../model/system.mjs";

export const SYSTEM_LEVEL = "systems";
export const CONTAINERS_LEVEL = "containers";
export const INTERFACES_LEVEL = "interfaces";
export const METHODS_LEVEL = "methods";

class GetSystemByCode {
    async system(code, addRemoved) {
        const systemRow = await systemDataService.selectSystemByCode(code);
        if (!systemRow) throw NotFound(`System with code = ${code} was not found`);
        return new System(systemRow);
    }
    async withContainers(code, addRemoved) {
        const [system, containersRows] = await Promise.all([
            this.system(code, addRemoved),
            systemDataService.selectSystemContainers(code)
        ]);
        const containersMap = {};

        (addRemoved ? containersRows : containersRows.filter(c => c.status !== "REMOVED"))
            .forEach(row => {
                system.addContainer(containersMap[row.code] = new Container(row));
            });
        return { system: system, containersMap: containersMap };
    }
    async withInterfaces(code, addRemoved) {
        const [{ system, containersMap }, containersRows] = await Promise.all([
            this.withContainers(code, addRemoved),
            systemDataService.selectSystemContainers(code)
        ]);

        const interfacesMap = {}

        await Promise.all(Object.keys(containersMap)
            .map(code => interfaceDataService.selectContainerInterfaces(code)
                .then(rows => {
                    rows.forEach(row => {
                        interfacesMap[row.code] = containersMap[code].addInterface(row);
                    })
                })));

        return { system: system, containersMap: containersMap, interfacesMap: interfacesMap };
    }
    async withMethods(code, addRemoved) {
        const { system, interfacesMap } = await this.withInterfaces(code, addRemoved);
        const selectMethodsPromises = Object.keys(interfacesMap)
            .map(interfaceCode =>
                interfaceDataService.selectInterfaceMethods(interfaceCode)
                    .then(methodsRows => {
                        methodsRows.forEach(methodRow => interfacesMap[interfaceCode].addMethod(methodRow))
                    }));

        await Promise.all(selectMethodsPromises);
        return system;
    }
}

export default new GetSystemByCode();