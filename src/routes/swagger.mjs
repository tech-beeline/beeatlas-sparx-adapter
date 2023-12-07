import fs from 'fs'


class SwaggerDefinition {
    static load(examples) {
        let swaggerApi = JSON.parse(fs.readFileSync('./src/swagger/capabilities-api.json'));
        return swaggerApi;
        /*
        return async (request, response) => {
            return response.json(swaggerApi);
        }
        */
    }
}


export default SwaggerDefinition;