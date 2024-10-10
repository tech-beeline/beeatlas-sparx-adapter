import { NotImplemented } from "../../utils/errors.mjs";



function prometheusTarget(datsource, query, ref, legend) {
    return {
        prometheus: {
            datasource: datsource,
            query: query,
            ref: ref,
            legend: legend
        }
    }
}




class RestMethodStatPanel {
    method;
    path;
    sla;
    title;
    description;
    constructor(method, path, sla, { title, description } = { title: `${method} ${path}` }) {
        this.method = method;
        this.path = path;
        this.sla = sla;
        this.title = title;
        this.description = description;
    }

    get ingressPath() {
        return this.path?.split('/')
            .map(a => a.startsWith('{') && a.endsWith('}') ? `(.*)` : a)
            .join('\\/');
    }

    get ingressQuery() {
        return `json.request_uri: "/${this.ingressPath}/" AND json.request_method: "${this.method}"`
    }

    get promTrafficQuery() {
        return `sum (increase(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}))`;
    }

    get promSuccesQuery() {
        return `sum (increase(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})", status="200"}))`;
    }

    get promTrafficTarget() {
        return {
            prometheus: {
                datasource: PROMETHEUS_DEFAULT_DATASOURCE,
                query: this.promTrafficQuery,
                ref: "PROM_TRAFFIC",
                legend: "Prometheus Traffic"
            }
        }
    }

    promPercentileLatency(p) {
        return `quantile_over_time (${p}, avg((sum(rate(http_server_requests_seconds_sum{uri=\"${this.path}\", method=~"(?i:${this.method})"}))
/ sum(rate(http_server_requests_seconds_count{uri=\"${this.path}\", method=~"(?i:${this.method})"}) > 0  ))) [$__rate_interval])`
    }

    build() {
        const sla_thresholds = [];
        if (this.sla?.rps) sla_thresholds.push(expressionTarget(this.sla.rps, RPS_THRESHOLD_REF));

        return {
            stat: {
                title: this.title,
                datasource: "-- Mixed --",
                targets: [
                    opensearchTarget(INGRESS_DEFAULT_DATASOURCE, this.ingressQuery, INGRESS_TRAFFIC_REF, "Ingress Traffic"),
                    prometheusTarget(PROMETHEUS_DEFAULT_DATASOURCE, this.promTrafficQuery, PROM_TRAFFIC_REF, "Prometheus Traffic"),
                    opensearchTarget(INGRESS_DEFAULT_DATASOURCE, this.ingressQuery + " AND json.status: [100 TO 299] 404", INGRESS_SUCCESS_REF, "Ingress success"),
                    prometheusTarget(PROMETHEUS_DEFAULT_DATASOURCE, this.promSuccesQuery, PROM_SUCCESS_REF, "Prometheus Success"),
                    opensearchPercentileTarget(INGRESS_DEFAULT_DATASOURCE, this.ingressQuery + " AND json.status: [100 TO 299] 404", INGRESS_P75_REF, "Ingress P75", 75),
                    opensearchPercentileTarget(INGRESS_DEFAULT_DATASOURCE, this.ingressQuery + " AND json.status: [100 TO 299] 404", INGRESS_P95_REF, "Ingress P95", 95),
                    prometheusTarget(PROMETHEUS_DEFAULT_DATASOURCE, this.promPercentileLatency(0.75), PROM_P75_REF, "Prometheus P75", 75),
                    prometheusTarget(PROMETHEUS_DEFAULT_DATASOURCE, this.promPercentileLatency(0.95), PROM_P95_REF, "Prometheus 95", 95)
                ]
            }
        }
    }
}

export default RestMethodStatPanel;