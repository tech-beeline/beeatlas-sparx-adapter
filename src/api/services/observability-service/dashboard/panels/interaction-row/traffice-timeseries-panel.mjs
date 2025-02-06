import { PANEL_DATASOURCE } from "./const.mjs";

export class TrafficTimeseriesPanel {
    id;
    gridPos;
    datasource = PANEL_DATASOURCE;
    gridPos = { h: 4, w: 18, x: 6 };
    targets;
    fieldConfig = {
        defaults: {
            "color": {
                "mode": "palette-classic"
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
                    "mode": "line+area"
                }
            },
            "mappings": [],
            "thresholds": {
                "mode": "absolute",
                "steps": [
                    {
                        "color": "green",
                        "value": null
                    }
                ]
            },
            "unit": "reqps"
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
    };

    transformations = [
        {
            "id": "filterByRefId",
            "options": {
                "include": "TPS|TPSThreshold1"
            }
        },
        {
            "id": "configFromData",
            "options": {
                "configRefId": "TPSThreshold1",
                "mappings": [
                    {
                        "fieldName": "TPSThreshold1",
                        "handlerKey": "threshold1"
                    }
                ]
            }
        }
    ];

    type = "timeseries";
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