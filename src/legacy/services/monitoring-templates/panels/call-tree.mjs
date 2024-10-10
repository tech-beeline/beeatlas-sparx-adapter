const DEFAULT_FIELD_CONFIG_MAPPINGS = [
    {
        options: {
            "0": {
                "color": "green",
                "index": 0,
                "text": "OK"
            },
            "1": {
                "color": "red",
                "index": 1,
                "text": "CRITICAL"
            },
            "-1": {
                "color": "#c9c9c9",
                "index": 4,
                "text": "TBD"
            }
        },
        type: "value"
    },
    {
        options: {
            from: 0,
            result: {
                "color": "orange",
                "index": 2,
                "text": "WARNING"
            },
            to: 1
        },
        type: "range"
    },
    {
        options: {
            match: "null",
            result: {
                color: "yellow",
                index: 3,
                text: "NO DATA"
            }
        },
        type: "special"
    }
]


function latancyBarguage(id, y, targetPanelId) {
    return {
        id: id,
        gridPos: {
            h: 1,
            w: 3,
            x: 17,
            y: y
        },
        type: bargauge,
        transformations: [
            {
                id: "filterByRefId",
                options: {
                    include: "Latency95|LatencyThreshold1"
                }
            },
            {
                id: "configFromData",
                options: {
                    applyTo: {
                        id: "byName",
                        options: "Latency95"
                    },
                    configRefId: "LatencyThreshold1",
                    mappings: [
                        {
                            fieldName: "LatencyThreshold1",
                            handlerKey: "threshold1"
                        }
                    ]
                }
            }
        ],
        datasource: {
            type: "datasource",
            uid: "-- Dashboard --"
        },
        pluginVersion: "8.5.10",
        description: "",
        fieldConfig: {
            defaults: {
                mappings: [],
                thresholds: {
                    mode: "absolute",
                    steps: [
                        {
                            color: "green",
                            value: null
                        }
                    ]
                },
                color: {
                    fixedColor: "transparent",
                    mode: "thresholds"
                },
                max: 15,
                min: 0,
                noValue: "N/A",
                unit: "s"
            },
            overrides: []
        },
        options: {
            reduceOptions: {
                values: false,
                calcs: [
                    "mean"
                ],
                fields: "/^Latency95$/",
                limit: 3
            },
            orientation: "horizontal",
            displayMode: "gradient",
            showUnfilled: true,
            minVizWidth: 0,
            minVizHeight: 10,
            text: {
                "valueSize": 16
            }
        },
        targets: [
            {
                datasource: {
                    type: "datasource",
                    uid: "-- Dashboard --"
                },
                panelId: targetPanelId,
                refId: "A"
            }
        ]
    }
}


function callPanel(seq, displayName, x, y, statPanelId) {
    return {
        id: seq.next(),
        gridPos: { h: 1, w: 19 - x, x: x, y: y },
        datasource: {
            type: "datasource",
            uid: "-- Dashboard --"
        },
        depth: 1,
        fieldConfig: {
            defaults: {
                color: {
                    fixedColor: "transparent",
                    mode: "continuous-GrYlRd"
                },
                displayName: displayName,
                mappings: DEFAULT_FIELD_CONFIG_MAPPINGS,
                max: 1,
                min: 0,
                thresholds: {
                    mode: "absolute",
                    steps: [
                        {
                            color: "green",
                            value: null
                        },
                        {
                            color: "red",
                            value: 1
                        }
                    ]
                }
            },
            overrides: []
        },
        options: {
            colorMode: "value",
            graphMode: "none",
            justifyMode: "auto",
            orientation: "auto",
            reduceOptions: {
                calcs: [
                    "lastNotNull"
                ],
                fields: "",
                limit: 3,
                values: false
            },
            text: {
                titleSize: 14,
                valueSize: 18
            },
            textMode: "value_and_name"
        },
        targets: [
            {
                datasource: {
                    "type": "datasource",
                    "uid": "-- Dashboard --"
                },
                panelId: statPanelId,
                refId: "A"
            }
        ],
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
                    reducers: [
                        "lastNotNull"
                    ]
                }
            },
            {
                id: "concatenate",
                options: {}
            },
            {
                id: "calculateField",
                options: {
                    alias: "",
                    binary: {
                        left: "LatencyState 1",
                        reducer: "sum",
                        right: "LatencyState 2"
                    },
                    mode: "reduceRow",
                    reduce: {
                        include: [],
                        reducer: "max"
                    },
                    replaceFields: true
                }
            }
        ],
        type: "stat"
    }
}

export default function callTreePanel(seq, callTree, y = 14) {

    const call_panels = [];

    let order = 1;
    const headerId = seq.next();

    function buildCallPanels(messages, depth = 0) {
        for (const m of messages) {
            if (m.interaction) {
                call_panels.push(callPanel(seq, `${order}.${m.client_code ?? m.client_name}->${m.server_code ?? m.server_name} ${m.name}`, depth, y + order++, m.interaction.statPanel.id))
            }

            if (m.children?.length) {
                buildCallPanels(m.children, depth + 1)
            }
        }
    }

    buildCallPanels(callTree.length > 1 ? callTree : callTree[0].children)

    return {
        collapsed: true,
        gridPos: { h: 1, w: 24, x: 0, y: y },
        id: headerId,
        panels: call_panels,
        title: "Sequence состояний интерфейсных соглашений",
        type: "row"
    }
}