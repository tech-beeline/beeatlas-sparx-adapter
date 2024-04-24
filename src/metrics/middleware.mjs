import exporess from 'express'
import client from 'prom-client'


const register = new client.Registry()

register.setDefaultLabels({
    app: 'ea-board'
})

let httpRequestDurationMicroseconds = new client.Histogram(
    {
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in microseconds',
        labelNames: ['method', 'path', 'code'],

    })

register.registerMetric(httpRequestDurationMicroseconds)

/**
 * 
 * @param {exporess.Request} req 
 * @param {*} res 
 * @param {*} next 
 */
export default async function RESTMetric(req, res, next) {
    if (req.path === '/metrics') {
        res.setHeader('Content-Type', register.contentType)
        res.send(await register.metrics());
        return;
    }
    const end = httpRequestDurationMicroseconds.startTimer();
    await next();
    end({ path: req.path, code: res.statusCode, method: req.method })
}