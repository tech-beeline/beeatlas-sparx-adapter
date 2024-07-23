import express from "express";
import e2eProcessSerivce from "../services/e2e-process-service.mjs";
import { NotImplemented } from "../utils/errors.mjs";


function processError(error, response) {
    console.error(error);
    if (!error) return response.status(500);

    if (error.status) {
        return response.status(error.status).json({ message: error.message });
    }
    return response.status(500).json({ message: error.message })
}

class E2EProcessController {
    constructor() {
        this.getProcesses = this.getProcesses.bind(this);
        this.getProcessSystems = this.getProcessSystems.bind(this)
    }
    async getProcessMessages(request, response, next) {
        try {
            return response.json(await e2eProcessSerivce.getProcessScenario(request.params.code, request.params))
        } catch (error) {
            processError(error, response);
        }
    }
    async getProcesses(request, response, next) {
        try {
            response.json(await e2eProcessSerivce.getE2EProcesses());
        } catch (error) {
            processError(error, response);
        }
    }
    async getProcessSystems(request, response, next) {
        try {
            let systems = await e2eProcessSerivce.getProcessSystems();
            NotImplemented();
        } catch (error) {
            processError(error, response);
        }
    }
    async getProcessSummary(request, response) {
        try {
            response.json(await e2eProcessSerivce.getProcessSummary(request.params.code));
        } catch (error) {
            processError(error, response);
        }
    }
    async getProcessBusinessInterctions(request, response) {
        try {
            response.json(await e2eProcessSerivce.getProcessBusinessInterctions(request.params.code));
        } catch (error) {
            processError(error, response);
        }
    }
}

export default new E2EProcessController();