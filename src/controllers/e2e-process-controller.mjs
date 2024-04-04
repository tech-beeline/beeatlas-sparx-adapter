import express from "express";
import e2eProcessSerivce from "../services/e2e-process-serivce.mjs";


function processError(error, response) {
    console.error(error);
    if (!error) return response.status(500);

    if (error.status) {
        return response.status(error.status).json({ message: error.message });
    }
    return response.status(500).json({ message: error.message })
}

class E2EProcessController {
    async getProcessMessages(request, response, next) {
        try {
            return response.json(await e2eProcessSerivce.getProcessMessages(request.params.code))
        } catch (error) {
            processError(error, response);
        }
    }
    async getProcesses(request, response, next) {
        try {
            response.json( await e2eProcessSerivce.getE2EProcesses());
        } catch (error) {
            processError(error, response);
        }
    }
}

export default new E2EProcessController();