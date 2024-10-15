import { ArchMetricsRepository, TechnicalCapabilitiesRepository } from '../../repositories/index.mjs';
import TechnicalCapability from "../../model/technical-capability-model.mjs";
import { BadRequest, NotImplemented } from '../../../utils/errors.mjs';


const tcDataService = new TechnicalCapabilitiesRepository();


export const createTC = async (tc) => {
    await tcDataService.insertTC(tc);
    ArchMetricsRepository.onTCChanged({ code: tc.code, name: tc.name });
    return tcDataService.updateParentBcForTC(tc.code, tc.parents.map(p => p.code));
}

/**
 * 
 * @param {TechnicalCapability} currentTC 
 * @param {TechnicalCapability} targetTC 
 */
export const updateTC = async (currentTC, targetTC) => {
    if (currentTC.system?.code !== targetTC.system?.code)
        throw BadRequest('Изменение системы, владеющий ТС не предусмотрено');

    if (currentTC.name !== targetTC.name || currentTC.description !== targetTC.description || currentTC.version !== targetTC.version) {
        await tcDataService.updateTC(targetTC);
        ArchMetricsRepository.onTCChanged({ code: targetTC.code, name: targetTC.name });
    }
    await tcDataService.updateParentBcForTC(targetTC.code, targetTC.parents.map(p => p.code));
}
