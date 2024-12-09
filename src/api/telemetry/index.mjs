import client from 'prom-client'
import {
    checkExpire,
    httpRequestDurationMicroseconds,
    httpRequestMax
} from './rest-api-telemetry.mjs';

import {
    C4PluginUsersCounter,
    C4StartCounter
} from './c4-plugin-telemetry.mjs';

const register = new client.Registry()

register.setDefaultLabels({
    system: 'FDMSHOWCASEAPP', container: 'dashboard', interface: 'sparx-api'
});

register.registerMetric(httpRequestDurationMicroseconds)
register.registerMetric(httpRequestMax)

register.registerMetric(C4StartCounter)
register.registerMetric(C4PluginUsersCounter)

/**
 * 
 * @param {exporess.Request} req 
 * @param {*} res 
 * @param {*} next 
 */
export async function PrometheusHandler(req, res, next) {
    checkExpire();
    res.setHeader('Content-Type', register.contentType)
    res.send(await register.metrics());
    return;
}