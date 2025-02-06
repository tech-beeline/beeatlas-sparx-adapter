import { PANEL_DATASOURCE } from "./const.mjs";

export class TrafficStatePanel {
    id;
    gridPos;
    datasource = PANEL_DATASOURCE;
    gridPos = { h: 4, w: 4, x: 2 };

    targets;
    fieldConfig = {
        "defaults": {
            "color": {
                "mode": "thresholds"
            },
            "displayName": "Количество запросов",
            "mappings": [],
            "min": 0,
            "thresholds": {
                "mode": "percentage",
                "steps": [
                    {
                        "color": "green",
                        "value": null
                    },
                    {
                        "color": "orange",
                        "value": 80
                    },
                    {
                        "color": "red",
                        "value": 100
                    }
                ]
            },
            "unit": "reqps"
        },
        "overrides": []
    };
    options = {
        "colorMode": "background",
        "graphMode": "none",
        "justifyMode": "center",
        "orientation": "vertical",
        "reduceOptions": {
            "calcs": [
                "lastNotNull"
            ],
            "fields": "",
            "values": false
        },
        "text": {},
        "textMode": "value_and_name"
    }
    transformations = [
        {
            "id": "filterByRefId",
            "options": {
                "include": "TPS|TPSThreshold"
            }
        },
        {
            "id": "configFromData",
            "options": {
                "configRefId": "TPSThreshold",
                "mappings": [
                    {
                        "fieldName": "TPSThreshold",
                        "handlerKey": "max"
                    }
                ]
            }
        }
    ]
    type = "stat";

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