import { PANEL_DATASOURCE } from "./const.mjs";

export class ErrorRateTimeline {
    id;
    gridPos = { h: 2, w: 18, x: 6 };
    datasource = PANEL_DATASOURCE
    targets;
    fieldConfig = {
        "defaults": {
            "color": {
                "mode": "continuous-GrYlRd"
            },
            "custom": {
                "fillOpacity": 100,
                "lineWidth": 0,
                "spanNulls": false
            },
            "mappings": [],
            "max": 1,
            "min": 0,
            "thresholds": {
                "mode": "absolute",
                "steps": [
                    {
                        "color": "green",
                        "value": null
                    }
                ]
            },
            "unit": "percent"
        },
        "overrides": []
    };
    maxDataPoints = 100;
    options = {
        "alignValue": "left",
        "legend": {
            "displayMode": "hidden",
            "placement": "bottom"
        },
        "mergeValues": true,
        "rowHeight": 0.9,
        "showValue": "never",
        "tooltip": {
            "mode": "single",
            "sort": "none"
        }
    };
    transformations = [
        {
            id: "filterByRefId",
            options: {
                "include": "ErrorThreshold|Error"
            }
        },
        {
            id: "renameByRegex",
            options: {
                "regex": "(State)",
                "renamePattern": ""
            }
        },
        {
            id: "configFromData",
            options: {
                applyTo: {
                    id: "byName",
                    options: "Error"
                },
                "configRefId": "ErrorThreshold",
                "mappings": [
                    {
                        "fieldName": "ErrorThreshold",
                        "handlerKey": "max"
                    }
                ]
            }
        }
    ]
    type = "state-timeline";

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