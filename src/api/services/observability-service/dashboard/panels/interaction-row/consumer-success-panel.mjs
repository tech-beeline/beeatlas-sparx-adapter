import { PANEL_DATASOURCE } from "./const.mjs";

export class ConsumerSuccessPanel {
    type = "stat";
    id;
    gridPos = { h: 4, w: 4, x: 2 };
    options = {
        colorMode: "background",
        graphMode: "none",
        justifyMode: "center",
        orientation: "vertical",
        reduceOptions: {
            calcs: [
                "lastNotNull"
            ],
            fields: "",
            values: false
        },
        text: {},
        textMode: "value_and_name"
    };
    transformations = [
        {
            id: "filterByRefId",
            options: {
                include: "LatencyPercent"
            }
        }
    ];
    filedConfig = {
        defaults: {
            color: {
                mode: "thresholds"
            },
            displayName: "Успешных по времени",
            mappings: [
                {
                    options: {
                        from: 95,
                        result: {
                            color: "green",
                            index: 0,
                            text: ">95%"
                        },
                        to: 100
                    },
                    type: "range"
                },
                {
                    options: {
                        from: 75,
                        result: {
                            color: "orange",
                            index: 1,
                            text: "75-95%"
                        },
                        to: 95
                    },
                    type: "range"
                },
                {
                    options: {
                        from: 0,
                        result: {
                            color: "red",
                            index: 2,
                            text: "<75%"
                        },
                        to: 75
                    },
                    type: "range"
                }
            ],
            max: 1,
            min: 0,
            thresholds: {
                mode: "absolute",
                steps: [
                    {
                        "color": "red",
                        "value": null
                    }
                ]
            },
            unit: "none"
        },
        "overrides": []
    }
    targets;
    /**
     *
     */
    constructor(seq,statPanelId, yPos) {
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