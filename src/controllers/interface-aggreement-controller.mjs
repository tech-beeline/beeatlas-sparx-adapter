import express from "express";
import interfaceAgreementService from "../services/interface-agreement-service.mjs";

//const Request = express.Request;


function processError(error, response) {
    console.error(error);
    if (!error) return response.status(500);

    if (error.status) {
        return response.status(error.status).json({ message: error.message });
    }
    return response.status(500).json({ message: error.message })
}

class IAController {
    /**
     * 
     * @param {express.Request} request 
     * @param {express.Response} response 
     * @param {*} next 
     */
    async getInterfaceAgreement(request, response, next) {
        try {
            console.log( request.accepts())
            const content = await interfaceAgreementService.getIARawContent(decodeURIComponent(request.params.ia_path));
            if (content) return response.type('text/plain').send(content.toString());

            throw Object.assign(Error(`ia ${request.params.ia_path} not found`), { status: 404 })
        } catch (error) {
            processError(error, response);
        }
    }
}

export default new IAController();

