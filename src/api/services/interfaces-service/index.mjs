import { NotImplemented } from "../../../utils/errors.mjs";
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
    async changeMethod(interfaceCode, method) {
        const isMethodsEqual = (a, b) =>
            a.name === b.name &&
            a.description === b.description &&
            a.returnType === b.returnType;
        if (!isMethodsEqual(method.current, method.target)) {
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
        await interfaceDataService.insertInterface(
            containerCode,
            interfaceData.name,
            interfaceData.code,
            interfaceData.version,
            interfaceData.description,
            interfaceData.protocol,
            interfaceData.api_url);

        for (const method of interfaceData.methods ?? []) {
            await this.addMethod(interfaceData.code, method);
        }
    }

    /**
     * 
     * @param {{current: APIInterface, target: APIInterface}} interfaceData 
     */
    async changeInterface(interfaceData) {
        const isInterfacesEqual = (a, b) =>
            a && b && a.name === b.name && a.version === b.version && a.description === b.description;
        if (!isInterfacesEqual(interfaceData.current, interfaceData.target)) {
            NotImplemented();
        }

        const methodsMap = (interfaceData.target.methods ?? [])
            .reduce((acc, m) => Object.assign(acc, { [m.name]: { target: m } }), {});
        const currentMethods = await interfaceDataService.selectMethods(interfaceData.target.code);
        currentMethods.forEach(m => {
            (methodsMap[m.name] ?? (methodsMap[m.name] = {})).current = m
        });

        const methods = Object.values(methodsMap);

        const newMethods = methods.filter(m => !m.current).map(m => m.target);
        for (const method of newMethods) {
            await this.addMethod(interfaceData.target.code, method);
        }
        const methodsToUpdate = methods.filter(m => m.current && m.target);
        for (const method of methodsToUpdate) {
            await this.changeMethod(interfaceData.code, method);
        }
        const removedMethods = methods.filter(m => !m.target).map(m => m.current);
        for (const method of removedMethods) {
            NotImplemented();
        }
    }
}

export default new InterfacesService();