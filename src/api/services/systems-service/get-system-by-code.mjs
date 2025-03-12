import { NotFound } from "../../../utils/errors.mjs";
import System, { Container } from "../../model/system.mjs";
import {
    InterfacesRepository,
    SystemsRepository
} from "../../repositories/index.mjs";
import { REMOVED_STATUS } from "../../repositories/systems-repository/const.mjs";

const interfaceDataService = new InterfacesRepository();
const systemDataService = new SystemsRepository();

class GetSystemByCode {
    async system(systemCode, addRemoved) {
        const systemRow = await systemDataService.selectSystemByCode(systemCode);
        if (!systemRow) throw NotFound(`System with code = ${systemCode} was not found`);
        return new System(systemRow);
    }
    async withContainers(systemCode, addRemoved) {
        const [system, containersRows] = await Promise.all([
            this.system(systemCode, addRemoved),
            systemDataService.selectSystemContainers(systemCode)
        ]);
        const containersMap = {};

        (addRemoved ? containersRows : containersRows.filter(c => c.status !== "REMOVED"))
            .forEach(row => {
                system.addContainer(containersMap[row.code.toLowerCase()] = new Container(row));
            });
        return { system: system, containersMap: containersMap };
    }
    async withInterfaces(systemCode, addRemoved) {
        const { system, containersMap } = await this.withContainers(systemCode, addRemoved);

        const interfacesMap = {}

        for (const containerCode of Object.keys(containersMap)) {
            const apiRows = await interfaceDataService.selectContainerInterfaces(containerCode);
            for (const row of apiRows) {
                if (row.status !== REMOVED_STATUS || addRemoved) {
                    interfacesMap[row.code.toLowerCase()] = containersMap[containerCode].addInterface(row);
                }
            }
        }

        return { system: system, containersMap: containersMap, interfacesMap: interfacesMap };
    }
    async withMethods(code, addRemoved) {
        const { system, interfacesMap } = await this.withInterfaces(code, addRemoved);
        const selectMethodsPromises = Object.keys(interfacesMap)
            .map(interfaceCode =>
                interfaceDataService.selectInterfaceMethods(interfaceCode)
                    .then(methodsRows => {
                        methodsRows.forEach(methodRow => 
                            interfacesMap[interfaceCode].addMethod(methodRow))
                    }));

        await Promise.all(selectMethodsPromises);
        return system;
    }
}

export default new GetSystemByCode();