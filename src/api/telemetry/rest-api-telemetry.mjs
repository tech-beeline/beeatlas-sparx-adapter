import client from 'prom-client'

export const httpRequestDurationMicroseconds = new client.Histogram(
    {
        name: 'http_server_requests_seconds',
        help: 'Duration of HTTP requests in microseconds',
        labelNames: ['method', 'path', 'code', 'status', 'uri'],
    })

export const httpRequestMax = new client.Gauge({
    name: 'http_server_requests_seconds_max',
    help: 'Max Duration of HTTP requests in microseconds',
    labelNames: ['method', 'path', 'code', 'status', 'uri'],
});

const REQUEST_MAX_EXPIRE = 180;
let requestMax = 0;
let requestExpireTime = Date.now() + REQUEST_MAX_EXPIRE * 1000;

export function checkExpire() {
    if (Date.now() > requestExpireTime) {
        requestMax = 0;
        requestExpireTime += REQUEST_MAX_EXPIRE * 1000;
    }
}

export async function registerAPIRequestTelemetry(req, res, next, fn, path, method) {
    checkExpire();
    const end = httpRequestDurationMicroseconds.startTimer();
    if (fn) { await fn(req, res, next); } else res.status(501).send("Нет обработчика для запроса")
    const labels = { path: path, uri: path, status: res.statusCode, code: res.statusCode, method: method };
    httpRequestMax.set(labels, requestMax = Math.max(requestMax, end(labels)));
}

export function createPrometheusDecorator(fn, path, method) {
    return async (req, res, next) => registerAPIRequestTelemetry(req, res, next, fn, path, method);
}
