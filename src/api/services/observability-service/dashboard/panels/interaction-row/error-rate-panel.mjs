import { PANEL_DATASOURCE } from "./const.mjs";

export class ErrorRatePanel {
    id;
    gridPos;
    datasource = PANEL_DATASOURCE;
    gridPos = { h: 2, w: 4, x: 2 };

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
    fieldConfig = {
        defaults: {
            color: {
                mode: "thresholds"
            },
            displayName: "Ошибочных запросов",
            mappings: [],
            min: 0,
            noValue: "0",
            thresholds: {
                mode: "percentage",
                steps: [
                    {
                        color: "green",
                        value: null
                    },
                    {
                        color: "orange",
                        value: 1
                    },
                    {
                        color: "red",
                        value: 100
                    }
                ]
            },
            unit: "percent"
        },
        overrides: []
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
        "textMode": "auto"
    };

    targets;

    transformations = [
        {
            id: "filterByRefId",
            options: {
                include: "ErrorThreshold|Error"
            }
        },
        {
            id: "configFromData",
            options: {
                configRefId: "ErrorThreshold",
                mappings: [
                    {
                        fieldName: "ErrorThreshold",
                        handlerKey: "max"
                    }
                ]
            }
        }
    ];
    type = "stat";
}