export const INGRESS_DEFAULT_DATASOURCE = "logstash-ingress-provider-ia-monitoring";
export const PROMETHEUS_DEFAULT_DATASOURCE = "Prometheus-BeeInside";

export const INGRESS_TRAFFIC_REF = "INGRESS_TRAFFIC";
export const INGRESS_SUCCESS_REF = "INGRESS_SUCCESS";
export const INGRESS_P75_REF = "INGRESS_P75";
export const INGRESS_P95_REF = "INGRESS_P95";
export const PROM_TRAFFIC_REF = "PROM_TRAFFIC";
export const PROM_SUCCESS_REF = "PROM_SUCCESS";
export const PROM_P75_REF = "PROM_P75";
export const PROM_P95_REF = "PROM_P95";
export const RPS_THRESHOLD_REF = "RPS_THRESHOLD";


export function opensearchTarget(datasource, query, ref, alias, options = {}) {
    return {
        opensearch: {
            datasource: datasource,
            query: query,
            ref: ref,
            alias: alias,
            ...options
        }
    }
}

export function expressionTarget(exp, ref, type = "math") {
    return {
        expression: {
            type: type,
            expression: exp,
            ref: ref ?? undefined
        }
    }
}

export function prometheusTarget(datsource, query, ref, legend) {
    return {
        prometheus: {
            datasource: datsource,
            query: query,
            ref: ref,
            legend: legend
        }
    }
}


export function opensearchPercentileTarget(datasource, query, ref, alias, p) {
    return opensearchTarget(datasource, query, ref, alias, { metrics: [{ field: "json.request_time", type: "percentiles", options: { values: [p] } }] })
}
