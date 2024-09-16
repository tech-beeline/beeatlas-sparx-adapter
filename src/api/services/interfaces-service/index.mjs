import { NotImplemented } from "../../../utils/errors.mjs";
import interfaceDataService from "../../data/interface-data-service.mjs";
import { APIInterface } from "../../model/system.mjs";

class InterfacesService {

    /**
     * 
     * @param {APIInterface} interfaceData 
     * @param {string} containerCode 
     */
    async addInterface(interfaceData, containerCode) {
        interfaceDataService.insertInterface( )
        NotImplemented();
    }
}

export default new InterfacesService();