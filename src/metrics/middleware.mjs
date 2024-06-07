import exporess from 'express'
import client from 'prom-client'


const register = new client.Registry()

register.setDefaultLabels({
    system: 'FDMSHOWCASEAPP', container: 'ea-board', interface: 'sparx-api'
});

let httpRequestDurationMicroseconds = new client.Histogram(
    {
        name: 'http_server_requests_seconds',
        help: 'Duration of HTTP requests in microseconds',
        labelNames: ['method', 'path', 'code', 'uri'],
    })

register.registerMetric(httpRequestDurationMicroseconds)


const c4StartCounter = new client.Counter({
    name: 'vscode_c4_plugin_start',
    help: 'Duration of HTTP requests in microseconds',
    labelNames: ['version' ],
});

register.registerMetric(c4StartCounter)

export function registerC4PluginStart(version){
    c4StartCounter.inc({version: version} );
}

export function createPromDecorator(fn, path, method) {
    return async (req, res, next) => {
        const end = httpRequestDurationMicroseconds.startTimer();
        await fn(req, res, next);
        end({ path: path, uri: path, code: res.statusCode, method: method })
    }
}
//const paths = [ /a/ ]
/**
 * 
 * @param {exporess.Request} req 
 * @param {*} res 
 * @param {*} next 
 */
export default async function RESTMetric(req, res, next) {
    res.setHeader('Content-Type', register.contentType)
    res.send(await register.metrics());
    return;
}