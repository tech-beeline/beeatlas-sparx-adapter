import { ArchMetricsRepository, tcRepository, TechnicalCapabilitiesRepository } from '../../repositories/index.mjs';
import TechnicalCapability from "../../model/technical-capability-model.mjs";
import { BadRequest, NotImplemented } from '../../../utils/errors.mjs';
import eaRepository from '../../repositories/sparx-ea-repository/ea-repository.mjs';


const tcDataService = tcRepository;


export const createTC = async (tc) => {
    return eaRepository.transactionScope(async () => {

        await tcDataService.insertTC(tc);
        await tcDataService.updateParentBcForTC(tc.code, tc.parents.map(p => p.code));
        
        ArchMetricsRepository.onTCChanged({ code: tc.code, name: tc.name });
    });
}


/**
 * 
 * @param {TechnicalCapability} currentTC 
 * @param {TechnicalCapability} targetTC 
 */
export const updateTC = async (currentTC, targetTC) => {
    return eaRepository.transactionScope(async () => {

        if (currentTC.name !== targetTC.name
            || currentTC.description !== targetTC.description
            || currentTC.version !== targetTC.version
            || currentTC.author !== targetTC.author
            || currentTC.status !== targetTC.status
            || currentTC.goal_from !== targetTC.goal_from
            || currentTC.goal_to !== targetTC.goal_to) {
            await tcDataService.updateTC(targetTC);
        }
        await tcDataService.updateParentBcForTC(targetTC.code, targetTC.parents.map(p => p.code));

        ArchMetricsRepository.onTCChanged({ code: targetTC.code, name: targetTC.name });
    });
}
