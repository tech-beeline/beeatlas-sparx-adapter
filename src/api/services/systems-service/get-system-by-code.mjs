import { NotFound } from "../../../utils/errors.mjs";
import System, { Container } from "../../model/system.mjs";
import {
    appRepository,
    InterfacesRepository,
    SystemsRepository
} from "../../repositories/index.mjs";
import { REMOVED_STATUS } from "../../repositories/systems-repository/const.mjs";
import { containerRepository } from "../../repositories/systems-repository/container-repository.mjs";

const interfaceDataService = new InterfacesRepository();
const systemDataService = appRepository;

class GetSystemByCode {
    async system(systemCode, addRemoved) {
        const systemRow = await systemDataService.selectSystemByCode(systemCode);
        if (!systemRow) throw NotFound(`System with code = ${systemCode} was not found`);
        return new System(systemRow);
    }
    async withContainers(systemCode, addRemoved) {
        const [system, containersRows] = await Promise.all([
            this.system(systemCode, addRemoved),
            containerRepository.bySystemCode(systemCode)
        ]);
        const containersMap = {};

        const filtered = (addRemoved ? containersRows : containersRows.filter(c => c.status !== "REMOVED"));
        
        filtered.forEach(row => {
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
                if (!row.code) {
                    console.error(`Обнаружен интерфейс с пустым кодом, ${JSON.stringify(row)}`);
                }
                if (row.status !== REMOVED_STATUS || addRemoved) {
                    interfacesMap[row.code.toLowerCase()] = containersMap[containerCode].addInterface(row);
                }
            }
        }

        return { system: system, containersMap: containersMap, interfacesMap: interfacesMap };
    }
    async withMethods(code, addRemoved) {
        const { system, interfacesMap } = await this.withInterfaces(code, addRemoved);
        const selectMethodsPromises = Object.keys(interfacesMap) // TODO Пекределать на пакетный вызов
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