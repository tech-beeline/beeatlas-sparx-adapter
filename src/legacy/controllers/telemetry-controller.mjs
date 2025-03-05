import { registerC4PluginEvent, registerC4PluginStart } from "../../api/telemetry/c4-plugin-telemetry.mjs";

class TelemetryController {
    async postC4Plugin(request, response) {
        try {
            //let { version, action, user , template_id} = request.body;
            registerC4PluginEvent(request.body);
            response.status(200).send('OK');
        } catch (error) {
            console.error(error)
            response.status(500).send(error.message);
        }
    }
}

export default new TelemetryController();