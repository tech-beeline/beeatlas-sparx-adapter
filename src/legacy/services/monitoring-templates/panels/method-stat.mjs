import { expr } from "./primitive-panels.mjs";
import { OpensearchApiSource } from "./source-options/opensearch.mjs";
import { PrometheusApiSource } from "./source-options/prometheus.mjs";








/**
 * 
 * @param {*} src 
 * @returns {GrafanaApiSource}
 */
export function createGrafanaSource(src) {
    if (OpensearchApiSource.isOpenSearchSource(src)) {
        return new OpensearchApiSource(src);
    }
    if (PrometheusApiSource.IsPrometheusSource(src)) {
        return new PrometheusApiSource(src);
    }

    console.log('Странные настройки datasource для графаны', src);
}




export default function createInteractionStatPanel(interfaction, seq, yPos = 13) {
    const { index, uri, method, host, client, server, sla, grafanaSource } = interfaction;

    return interfaction.statPanel = {
        id: seq.next(),
        gridPos: { h: 2, w: 1, x: index % 24, y: yPos + Math.floor(index / 23) },
        type: "stat",
        title: `${index + 1}`,
        transformations: [
            {
                id: "filterByRefId",
                options: {
                    include: "LatencyState|ErrorState|State"
                }
            },
            {
                id: "reduce",
                options: {
                    includeTimeField: false,
                    mode: "reduceFields",
                    reducers: ["lastNotNull"]
                }
            },
            {
                id: "concatenate", options: {}
            },
            {
                id: "calculateField",
                options: {
                    mode: "reduceRow",
                    reduce: {
                        include: [],
                        reducer: "max"
                    },
                    replaceFields: true
                }
            }
        ],
        datasource: grafanaSource.datasource,
        fieldConfig: {
            defaults: {
                mappings: [
                    {
                        options: {
                            "0": {
                                color: "green",
                                index: 0,
                                text: "OK"
                            },
                            "1": {
                                color: "red",
                                index: 1,
                                text: "CRIT"
                            },
                            "-1": {
                                color: "#c9c9c9",
                                index: 4,
                                text: "TBD"
                            }
                        },
                        type: "value"
                    },
                    {
                        "options": {
                            "from": 0,
                            "result": {
                                "color": "orange",
                                "index": 2,
                                "text": "WARN"
                            },
                            "to": 1
                        },
                        "type": "range"
                    },
                    {
                        "options": {
                            "match": "null",
                            "result": {
                                "color": "yellow",
                                "index": 3,
                                "text": "N/A"
                            }
                        },
                        "type": "special"
                    }
                ],
                "thresholds": {
                    "mode": "absolute",
                    "steps": [
                        {
                            "color": "green",
                            "value": null
                        },
                        {
                            "color": "red",
                            "value": 1
                        }
                    ]
                },
                "color": {
                    "fixedColor": "transparent",
                    "mode": "continuous-GrYlRd"
                },
                "displayName": `${index + 1} ${method} ${uri}`,
                "max": 1,
                "min": 0
            },
            "overrides": []
        },
        options: {
            reduceOptions: {
                values: false,
                calcs: ["lastNotNull"],
                fields: "",
                limit: 3
            },
            orientation: "auto",
            textMode: "value",
            colorMode: "background",
            graphMode: "none",
            justifyMode: "auto",
            text: {}
        },
        targets: [
            grafanaSource.percentileTarget(method, uri, 75),
            grafanaSource.percentileTarget(method, uri, 95),
            grafanaSource.totalCountTarget(method, uri),
            grafanaSource.errorCountTarget(method, uri),
            expr("$A75 * 1", "Latency75"), expr("$A95 * 1", "Latency95"),
            expr(sla.latency * 1000 + '/1000', "LatencyThreshold1"), expr(sla.errorRate.toString(), "ErrorThreshold1"), expr(sla.rps.toString(), "TPSThreshold1"),
            expr("$C/$B * 100", "Error"), expr("$B / (60 * 5)", "TPS"),
            expr("(${Latency75} > ${LatencyThreshold1}) / 2 + (${Latency95} > ${LatencyThreshold1}) / 2", "LatencyState"),
            expr("($Error > 0) / 2 +\n($Error > $ErrorThreshold1) / 2", "ErrorState"),
            expr("($Latency95 < ${LatencyThreshold1}) * 95 + ($Latency75 < ${LatencyThreshold1}) * ($Latency95 > ${LatencyThreshold1}) * 75", "LatencyPercent")
        ],
        description: ""
    }
}