class TechnicalCapabilitiesController {
    async getTechnicalCapabilities(request, response) {
        try {
            throw Error('not implemented')
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
}

export default new TechnicalCapabilitiesController()