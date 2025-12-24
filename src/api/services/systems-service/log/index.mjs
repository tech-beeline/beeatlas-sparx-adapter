import fdmStorage from "../../../repositories/fdm-storage.mjs";
import { ArchMetricsRepository } from "../../../repositories/index.mjs";

/**
 * 
 * @param {string} systemCode 
 * @param {*} fromState 
 * @param {*} targetState 
 * @param {Error} error 
 */
export async function logErrorPutSystem(systemCode, fromState, targetState, error) {
    try {
        await ArchMetricsRepository.insertPutSystemLog(systemCode, fromState, targetState, null, { message: error.message, stack: error.stack });
    } catch (err) {
        console.error(err)
    }
}

export async function logSuccessPutSystem(systemCode, fromState, targetState, resultState) {
    try {
        await ArchMetricsRepository.insertPutSystemLog(systemCode, fromState, targetState, resultState, null);
    } catch (err) {
        console.error(err)
    }
}

