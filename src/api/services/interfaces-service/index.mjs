import { NotImplemented } from "../../../utils/errors.mjs";
import patchArray from "../../../utils/patch-array.mjs";
import interfaceDataService from "../../data/interface-data-service/index.mjs";
import { APIInterface, APIMethod } from "../../model/system.mjs";

class InterfacesService {

    async addMethod(interfaceCode, method) {
        if (!method) throw Error('Method parameter is not specified');
        const { name, description, returnType, rps, latency, error_rate } = method;
        if (!name) throw Error(`Method name is not specified`);

        return interfaceDataService.insertMethod(interfaceCode, name, description, returnType, rps, latency, error_rate)
    }
    /**
     * 
     * @param {string} interfaceCode 
     * @param {{current: APIMethod,target:APIMethod}} method 
     */
    async updateMethod(interfaceCode, currentMethod, targetMethod) {
        const isMethodsEqual = (a, b) =>
            a.name === b.name &&
            a.description === b.description &&
            a.returnType === b.returnType;

        if (!isMethodsEqual(currentMethod, targetMethod)) {
            NotImplemented('Update Method');
        }
        // [ ] Добавить обработку параметров
    }
    /**
     * 
     * @param {APIInterface} interfaceData 
     * @param {string} containerCode 
     */
    async addInterface(interfaceData, containerCode) {
        if (!interfaceData.code) throw Error(`One of interfaces for container with code=${containerCode} haven't code property`);
        const currentInterface = await interfaceDataService.selectInterfaceByCode(interfaceData.code);
        if (currentInterface) throw Error(`Interface with code=${interfaceData.code} already exists`);

        await interfaceDataService.insertInterface(
            containerCode,
            interfaceData.name,
            interfaceData.code,
            interfaceData.version,
            interfaceData.description,
            interfaceData.status,
            interfaceData.protocol,
            interfaceData.api_url);

        for (const method of interfaceData.methods ?? []) {
            await this.addMethod(interfaceData.code, method);
        }
    }

    /**
     * 
     * @param {APIInterface} currentInterface 
     * @param {APIInterface} targetInterface 
     */
    async updateInterface(currentInterface, targetInterface) {
        const isInterfacesEqual = (a, b) => a.name === b.name && a.version === b.version && a.description === b.description;
        if (!isInterfacesEqual(currentInterface, targetInterface)) {
            await interfaceDataService.updateInterface(targetInterface.name,
                currentInterface.code,
                targetInterface.version,
                targetInterface.description,
                targetInterface.status,
                targetInterface.protocol,
                targetInterface.specification
            )
        }

        await patchArray(
            targetInterface.methods ?? [],
            await interfaceDataService.selectMethods(targetInterface.code),
            m => m.name,
            (m) => this.addMethod(targetInterface.code, m),
            (currentMethod, targetMethod) => this.updateMethod(targetInterface.code, currentMethod, targetMethod),
            (m) => NotImplemented()
        );
    }

    /**
    * 
    * @param {APIInterface} currentInterface 
    */
    async markInterfaceRemoved(currentInterface) {
        if (currentInterface.status === 'REMOVED') {
            console.info('Skip removed interface')
            return;
        }

        await interfaceDataService.markInterfaceRemoved(`[REMOVED!]${currentInterface.name}`, currentInterface.code);
        for (const method of currentInterface.methods ?? []) {
            NotImplemented('Remove Methods');
        }
    }
}

export default new InterfacesService();