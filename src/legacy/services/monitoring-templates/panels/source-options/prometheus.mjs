import { GrafanaApiSource, formatQuery } from "./common.mjs";

export const PROMETHEUS_SOURCE_TAG = 'prometheus';
export const PROMETHEUS_API_SUM_TAG = 'prometheus-api-sum';
export const PROMETHEUS_API_COUNT_TAG = 'prometheus-api-count';
export const PROMETHEUS_API_TOTAL_FILTER = 'prometheus-api-total-filter';
export const PROMETHEUS_API_SUCCESS_FILTER = 'prometheus-api-success-filter';
export const PROMETHEUS_API_ERROR_FILTER = 'prometheus-api-error-filter';

const DEFAULT_API_SUM_COUNTER = 'http_server_requests_seconds_sum'
const DEFAULT_API_COUNT_COUNTER = 'http_server_requests_seconds_count'
const DEFAULT_API_SUCCES_FILTER = 'status="200", uri="${uri}"'
const DEFAULT_API_TOTAL_FILTER = 'uri="${uri}';
const DEFAULT_API_ERROR_FILTER = 'status!="200", uri="${uri}';

function prometheusPercentileExpr(sum_counter = DEFAULT_API_SUM_COUNTER, count_counter = DEFAULT_API_COUNT_COUNTER, success_filter = DEFAULT_API_SUCCES_FILTER, method, uri, percentile) {
    return `quantile_over_time(${percentile},
        (
          sum(rate(${sum_counter}{ ${formatQuery(success_filter, uri, method)} }))
        / 
          sum(rate(${count_counter}{ ${formatQuery(success_filter, uri, method)}}) > 0)
        ) 
      [20m])`;
}

function prometheusCountExpr(count_counter = DEFAULT_API_COUNT_COUNTER, filter, method, uri) {
    return `sum (delta ( ${count_counter}{${formatQuery(filter, uri, method)}}[5m]))`
}

export class PrometheusApiSource extends GrafanaApiSource {
    constructor(src) {
        super(src);
        this.datasource = {
            type: "prometheus",
            uid: this[PROMETHEUS_SOURCE_TAG]
        }
    }

    static IsPrometheusSource(src) {
        return src[PROMETHEUS_SOURCE_TAG];
    }

    #target(expr, ref) {
        return {
            datasource: this.datasource,
            editorMode: "code",
            expr: expr,
            hide: true,
            interval: "5m",
            range: true,
            refId: ref
        }
    }

    percentileTarget(method, uri, percentile) {
        return this.#target(prometheusPercentileExpr(
            this[PROMETHEUS_API_SUM_TAG],
            this[PROMETHEUS_API_COUNT_TAG],
            this[PROMETHEUS_API_SUCCESS_FILTER], method, uri, percentile), `A${percentile}`)
    }

    totalCountTarget(method, uri) {
        return this.#target(prometheusCountExpr(this[PROMETHEUS_API_COUNT_TAG], this[PROMETHEUS_API_TOTAL_FILTER] ?? DEFAULT_API_TOTAL_FILTER, method, uri), `B`)
    }

    errorCountTarget(method, uri) {
        return this.#target(prometheusCountExpr(this[PROMETHEUS_API_COUNT_TAG], this[PROMETHEUS_API_ERROR_FILTER] ?? DEFAULT_API_ERROR_FILTER, method, uri), `C`)
    }
}