import fdmStorage from "../../../repositories/fdm-storage.mjs";
import { ArchMetricsRepository } from "../../../repositories/index.mjs";


export async function logErrorPutSystem(systemCode, fromState, targetState, error) {
    try {
        await ArchMetricsRepository.insertPutSystemLog(systemCode, fromState, targetState, null, error);
    } catch (error) {
        console.error(error)
    }
}

export async function logSuccessPutSystem(systemCode, fromState, targetState, resultState) {
    try {
        await ArchMetricsRepository.insertPutSystemLog(systemCode, fromState, targetState, resultState, null);
    } catch (error) {
        console.error(error)
    }
}