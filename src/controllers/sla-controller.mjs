import slaService from "../services/sla-service.mjs";
import { BadRequest, ProcessError } from "../utils/errors.mjs";

class SLAController {
    async postInteractionSLA(request, response) {
        try {
            const { rps, latency, errorRate } = request.body;
            if (!rps) BadRequest('Не указан rps')
            if (!latency) BadRequest('Не указан latency')
            if (!errorRate) BadRequest('Не указан errorRate');

            response.json(await slaService.updateInteractionSLA(request.params.uid, rps, latency, errorRate));
        } catch (err) {
            ProcessError(err, response);
        }
    }
}

export default new SLAController();