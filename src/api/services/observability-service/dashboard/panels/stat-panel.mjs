import { expr } from "../../../../../legacy/services/monitoring-templates/panels/primitive-panels.mjs";
import { GrafanaApiSource } from "../sources/common.mjs";

const STAT_TRANSFORMATIONS = [
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
];

const STAT_FIELD_CONFIG = {
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
                options: {
                    from: 0,
                    result: {
                        color: "orange",
                        index: 2,
                        text: "WARN"
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
        thresholds: {
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
        //"displayName": `${index + 1} ${method} ${uri}`,
        "max": 1,
        "min": 0
    },
    "overrides": []
};


export class InteractionStat {
    id;
    type = "stat";
    gridPos;
    title;
    datasource;
    options = {
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
    };
    transformations = STAT_TRANSFORMATIONS;
    fieldConfig = STAT_FIELD_CONFIG;
    targets;
    /**
     * 
     * @param {*} id 
     * @param {*} index 
     * @param {GrafanaApiSource} source 
     * @param {*} yPos 
     */
    constructor(id, index, method, path, sla, source, yPos = 13) {
        this.id = id;
        this.gridPos = { h: 2, w: 1, x: index % 24, y: yPos + Math.floor(index / 23) };
        this.title = `${index + 1}`;

        this.targets = [
            source.percentileTarget(method, path, 75),
            source.percentileTarget(method, path, 95),
            source.totalCountTarget(method, path),
            source.errorCountTarget(method, path),
            expr("$A75 * 1", "Latency75"),
            expr("$A95 * 1", "Latency95"),
            expr("$C/($B + ($B==0)) * 100", "Error"),
            expr("$B / (60 * 5)", "TPS"),
            expr(sla.latency * 1000 + '/1000', "LatencyThreshold"),
            expr(sla.errorRate.toString(), "ErrorThreshold"),
            expr(sla.rps.toString(), "TPSThreshold"),
            expr("(${Latency75} > ${LatencyThreshold}) / 2 + (${Latency95} > ${LatencyThreshold}) / 2", "LatencyState"),
            expr("($Error > 0) / 2 +\n($Error > $ErrorThreshold) / 2", "ErrorState"),
            expr("($Latency95 < ${LatencyThreshold}) * 95 + ($Latency75 < ${LatencyThreshold}) * ($Latency95 > ${LatencyThreshold}) * 75", "LatencyPercent")
        ];
    }
}