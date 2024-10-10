import { registerC4PluginStart } from "../../api/telemetry/c4-plugin-telemetry.mjs";

class TelemetryController {
    async postC4Plugin(request, response) {
        try {
            let { version, action, user } = request.body;
            registerC4PluginStart(version, action, user);
            response.status(200).send('OK');
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
}

export default new TelemetryController();