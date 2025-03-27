import { NotImplemented } from "../../utils/errors.mjs";
import { MaintenanceService } from "./service.mjs";

export class MaintenanceController {
    service = new MaintenanceService();
    constructor(){
        this.getMethodsDoubles = this.getMethodsDoubles.bind(this);
    }
    async getMethodsDoubles(request, response) {
        response.json(await this.service.getMethodsDoubles());
    }
}