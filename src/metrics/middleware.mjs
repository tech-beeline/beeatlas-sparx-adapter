import exporess from 'express'
import client from 'prom-client'
import { NotImplemented } from '../utils/errors.mjs';


const register = new client.Registry()

register.setDefaultLabels({
    system: 'FDMSHOWCASEAPP', container: 'ea-board', interface: 'sparx-api'
});

let httpRequestDurationMicroseconds = new client.Histogram(
    {
        name: 'http_server_requests_seconds',
        help: 'Duration of HTTP requests in microseconds',
        labelNames: ['method', 'path', 'code', 'status', 'uri'],
    })

let httpRequestMax = new client.Gauge( {
    name: 'http_server_requests_seconds_max',
    help: 'Max Duration of HTTP requests in microseconds',
    labelNames: ['method', 'path', 'code', 'status', 'uri'],
})

register.registerMetric(httpRequestDurationMicroseconds)
register.registerMetric(httpRequestMax)

const REQUEST_MAX_EXPIRE = 180;
let requestMax = 0;
let requestExpireTime = Date.now() + REQUEST_MAX_EXPIRE * 1000;


const c4StartCounter = new client.Counter({
    name: 'vscode_c4_plugin_start',
    help: 'Количество запусков плагина',
    labelNames: ['version', 'action'],
});

register.registerMetric(c4StartCounter)

export function registerC4PluginStart(version, action = 'start') {
    c4StartCounter.inc({ version: version , action: action});
}

function checkExpire(){
    if( Date.now() > requestExpireTime){
        requestMax = 0;
        requestExpireTime += REQUEST_MAX_EXPIRE * 1000;
    }
}

export function createPromDecorator(fn, path, method) {
    return async (req, res, next) => {
        checkExpire();
        const end = httpRequestDurationMicroseconds.startTimer();
        if( fn) {await fn(req, res, next);} else res.status(501).send( "Нет обработчика для запроса" )
        const labels = { path: path, uri: path, status: res.statusCode, code: res.statusCode, method: method };
        httpRequestMax.set( labels, requestMax =  Math.max( requestMax, end(labels) ));
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
    checkExpire();
    res.setHeader('Content-Type', register.contentType)
    res.send(await register.metrics());
    return;
}