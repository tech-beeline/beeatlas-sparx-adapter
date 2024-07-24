import t_connector from "../utils/ea-model/t_connector.mjs";
import Repository from "../utils/ea-repo.mjs";
import { NotFound, NotImplemented } from "../utils/errors.mjs";
import { ERROR_RATE_THRESHOLD_TAG, LATENCY_THRESHOLD_TAG, RPS_THRESHOLD_TAG } from "./sql/interfaces-queries.mjs";


const TAG_MAP = {
    rps: RPS_THRESHOLD_TAG, latency: LATENCY_THRESHOLD_TAG, errorRate: ERROR_RATE_THRESHOLD_TAG
}

class SLAService {
    async updateInteractionSLA(uid, rps, latency, errorRate) {
        /** @type {t_connector} */
        let connector = await Repository.first(t_connector, { ea_guid: uid });
        if (!connector) throw NotFound(`Взимодействие с uid=${uid} не найдено`);

        await Repository.updateConnectorTags(connector.connector_id, { [RPS_THRESHOLD_TAG]: rps, [LATENCY_THRESHOLD_TAG]: latency, [ERROR_RATE_THRESHOLD_TAG]: errorRate }, [RPS_THRESHOLD_TAG, LATENCY_THRESHOLD_TAG, ERROR_RATE_THRESHOLD_TAG])
    }
}

export default new SLAService();