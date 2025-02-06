import { PANEL_DATASOURCE } from "./const.mjs";

export class ConsumerLatencyPanel {
    id;
    gridPos = { h: 4, w: 18, x: 6 };
    datasource = PANEL_DATASOURCE;
    fieldConfig = {
        "defaults": {
            "color": {
                "mode": "palette-classic",
                "seriesBy": "last"
            },
            "custom": {
                "axisLabel": "",
                "axisPlacement": "auto",
                "barAlignment": 0,
                "drawStyle": "line",
                "fillOpacity": 0,
                "gradientMode": "none",
                "hideFrom": {
                    "legend": false,
                    "tooltip": false,
                    "viz": false
                },
                "lineInterpolation": "smooth",
                "lineStyle": {
                    "fill": "solid"
                },
                "lineWidth": 1,
                "pointSize": 5,
                "scaleDistribution": {
                    "type": "linear"
                },
                "showPoints": "never",
                "spanNulls": false,
                "stacking": {
                    "group": "A",
                    "mode": "none"
                },
                "thresholdsStyle": {
                    "mode": "area"
                }
            },
            "mappings": [],
            "thresholds": {
                "mode": "absolute",
                "steps": [
                    {
                        "color": "transparent",
                        "value": null
                    },
                    {
                        "color": "dark-red",
                        "value": 0.5
                    }
                ]
            },
            "unit": "ms"
        },
        "overrides": []
    };

    options = {
        "legend": {
            "calcs": [
                "last"
            ],
            "displayMode": "table",
            "placement": "right"
        },
        "tooltip": {
            "mode": "single",
            "sort": "none"
        }
    }
    targets;

    transformations = [
        {
            "id": "filterByRefId",
            "options": {
                "include": "LatencyThreshold1|Latency75|Latency95"
            }
        },
        {
            "disabled": true,
            "id": "configFromData",
            "options": {
                "applyTo": {
                    "id": "byType",
                    "options": "number"
                },
                "configRefId": "LatencyThreshold1",
                "mappings": [
                    {
                        "fieldName": "LatencyThreshold1",
                        "handlerKey": "threshold1"
                    }
                ]
            }
        },
        {
            "id": "renameByRegex",
            "options": {
                "regex": "(Latency)",
                "renamePattern": "p"
            }
        }
    ];
    type = "timeseries"
    /**
     *
     */
    constructor(seq, statPanelId, yPos) {
        this.gridPos.y = yPos;
        this.id = seq.next();
        this.targets = [
            {
                datasource: PANEL_DATASOURCE,
                panelId: statPanelId,
                refId: "A"
            }
        ]
    }
}