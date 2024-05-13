import exporess from 'express'
import client from 'prom-client'


const register = new client.Registry()

register.setDefaultLabels({
    system: 'FDMSHOWCASEAPP', container: 'ea-board', interface: 'sparx-api'
});

let httpRequestDurationMicroseconds = new client.Histogram(
    {
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in microseconds',
        labelNames: ['method', 'path', 'code'],
    })

register.registerMetric(httpRequestDurationMicroseconds)


//const paths = [ /a/ ]
/**
 * 
 * @param {exporess.Request} req 
 * @param {*} res 
 * @param {*} next 
 */
export default async function RESTMetric(req, res, next) {
    if (req.path === '/actuator/prometheus') {
        res.setHeader('Content-Type', register.contentType)
        res.send(await register.metrics());
        //console.info('GET /actuator/prometheus');
        return;
    }

    if (!req.path.startsWith('/api')) {
        return next();
    }
    const end = httpRequestDurationMicroseconds.startTimer();
    await next();
    end({ path: req.path, code: res.statusCode, method: req.method })
}