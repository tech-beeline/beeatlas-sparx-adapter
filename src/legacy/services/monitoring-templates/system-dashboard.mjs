import { DEFAULT_FOLDER_UID, SYSTEM_UID_PREFIX } from "./const.mjs"
import { DASHBOARD_SOURCE, DEFAULT_MAPPINGS, DashboardTarget, REDUCE_LAST_NOT_NULL, Row, STAT_DEFAULT_FIELD_CONFIG, STAT_DEFAULT_OPTIONS, TIMESERIES_DEFAULT_FIELDS_CONFIG, TIMESERIES_DEFAULT_OPTIONS, TextPanel, calculateFieldMax, expr, filterByRefId, statPanel, timeseries } from "./panels/primitive-panels.mjs";
import Sequence from "./sequence.mjs"


function MethodStat(seq, m, grafanaSource, gridPos) {
    const [method, uri] = m.name.split(' ');

    return {
        id: seq.next(),
        gridPos: gridPos,
        type: "stat",
        title: method.name,
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
                        options: {
                            from: 0,
                            result: {
                                color: "orange",
                                index: 2,
                                text: "WARN"
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
                                text: "N/A"
                            }
                        },
                        type: "special"
                    }
                ],
                thresholds: {
                    mode: "absolute",
                    steps: [
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
                color: {
                    "fixedColor": "transparent",
                    "mode": "continuous-GrYlRd"
                },
                displayName: `!!!!!`,
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
            expr(m.latency * 1000 + '/1000', "LatencyThreshold1"), expr(m.error_rate.toString(), "ErrorThreshold1"), expr(m.rps.toString(), "TPSThreshold1"),
            expr("$C/$B * 100", "Error"), expr("$B / (60 * 5)", "TPS"),
            expr("(${Latency75} > ${LatencyThreshold1}) / 2 + (${Latency95} > ${LatencyThreshold1}) / 2", "LatencyState"),
            expr("($Error > 0) / 2 +\n($Error > $ErrorThreshold1) / 2", "ErrorState"),
            expr("($Latency95 < ${LatencyThreshold1}) * 95 + ($Latency75 < ${LatencyThreshold1}) * ($Latency95 > ${LatencyThreshold1}) * 75", "LatencyPercent")
        ]
    }
}

const LATENCY_EXPRS_WITHOUT_SLA = [expr("-2", "LatencyState")];
const ERROR_EXPRS_WITHOUT_SLA = [expr("-2", "ErrorState")];

function LATENCY_EXPRS_WITH_SLA(latency) {
    return [
        expr(latency * 1000 + '/1000', "LatencyThreshold1"),
        expr("(${Latency75} > ${LatencyThreshold1}) / 2 + (${Latency95} > ${LatencyThreshold1}) / 2", "LatencyState"),
        expr("($Latency95 < ${LatencyThreshold1}) * 95 + ($Latency75 < ${LatencyThreshold1}) * ($Latency95 > ${LatencyThreshold1}) * 75", "LatencyPercent")];
}

function ERROR_EXPRS_WITH_SLA(error_rate) {
    return [
        expr(error_rate.toString(), "ErrorThreshold1"),
        expr("($Error > 0) / 2 +\n($Error > $ErrorThreshold1) / 2", "ErrorState"),
    ]
}

function latencyStat(statId, m, grafanaSource, gridPos, exprs) {
    const [method, uri] = m.name.split(' ');

    return statPanel(statId, 'Latency', grafanaSource.datasource, [
        grafanaSource.percentileTarget(method, uri, 75),
        grafanaSource.percentileTarget(method, uri, 95),
        expr("$A75 * 1", "Latency75"), expr("$A95 * 1", "Latency95"),
        ...exprs
    ], {
        gridPos: gridPos,
        transformations: [
            filterByRefId('LatencyState'),
            REDUCE_LAST_NOT_NULL,
            {
                id: "concatenate", options: {}
            },
            calculateFieldMax()
        ],
        fieldConfig: STAT_DEFAULT_FIELD_CONFIG(m.name),
        options: STAT_DEFAULT_OPTIONS
    });
}

function LatancyPanels(seq, m, grafanaSource, y) {
    const statId = seq.next();

    return [
        latencyStat(statId, m, grafanaSource, { x: 0, y: y, h: 4, w: 2 }, m.latency ? LATENCY_EXPRS_WITH_SLA(m.latency) : LATENCY_EXPRS_WITHOUT_SLA),
        timeseries(seq, 'Latency', DASHBOARD_SOURCE, [
            DashboardTarget(statId)
        ],
            {
                gridPos: Object.assign({ x: 2, y: y, w: 20, h: 4 }),
                fieldConfig: TIMESERIES_DEFAULT_FIELDS_CONFIG('ms'),
                options: TIMESERIES_DEFAULT_OPTIONS,
                transformations: [
                    filterByRefId(['Latency75', 'Latency95'])
                ],
            })
    ]
}

function errorStat(statId, m, grafanaSource, gridPos, exprs) {
    const [method, uri] = m.name.split(' ');

    return statPanel(statId, 'Error Rate', grafanaSource.datasource, [
        grafanaSource.totalCountTarget(method, uri),
        grafanaSource.errorCountTarget(method, uri),
        expr("$C/$B * 100", "Error"),
        ...exprs
    ], {
        gridPos: gridPos,
        transformations: [
            filterByRefId('ErrorState'),
            REDUCE_LAST_NOT_NULL,
            {
                id: "concatenate", options: {}
            },
            calculateFieldMax()
        ],
        fieldConfig: STAT_DEFAULT_FIELD_CONFIG(m.name),
        options: STAT_DEFAULT_OPTIONS
    });
}
function ErrorRatePanels(seq, m, grafanaSource, y) {
    const statId = seq.next();
    return [
        errorStat(statId, m, grafanaSource, { x: 0, y: y, w: 2, h: 4 }, m.error_rate ? ERROR_EXPRS_WITH_SLA(m.error_rate) : ERROR_EXPRS_WITHOUT_SLA),
        timeseries(seq, 'Error Rate', DASHBOARD_SOURCE, [
            DashboardTarget(statId)
        ],
            {
                gridPos: Object.assign({ x: 2, y: y, w: 20, h: 4 }),
                fieldConfig: TIMESERIES_DEFAULT_FIELDS_CONFIG('%'),
                options: TIMESERIES_DEFAULT_OPTIONS,
                transformations: [
                    filterByRefId(['ErrorThreshold1', 'Error'])
                ],
            })
    ]
}
function rpsStat(statId, m, grafanaSource, gridPos, exprs) {
    const [method, uri] = m.name.split(' ');

    return statPanel(statId, 'RPS', grafanaSource.datasource, [
        grafanaSource.totalCountTarget(method, uri),
        ...exprs
    ], {
        gridPos: gridPos,
        transformations: [
            filterByRefId('TPS'),
            REDUCE_LAST_NOT_NULL,
            {
                id: "concatenate", options: {}
            },
            calculateFieldMax()
        ],
        fieldConfig: STAT_DEFAULT_FIELD_CONFIG(m.name),
        options: STAT_DEFAULT_OPTIONS
    });
}

function rpsPanels(seq, m, grafanaSource, y) {
    const statId = seq.next();
    return [
        rpsStat(statId, m, grafanaSource, { x: 0, y: y, w: 2, h: 4 }, [expr("$B / (60 * 5)", "TPS")]),
        timeseries(seq, 'RPS', DASHBOARD_SOURCE, [
            DashboardTarget(statId)
        ],
            {
                gridPos: Object.assign({ x: 2, y: y, w: 20, h: 4 }),
                fieldConfig: TIMESERIES_DEFAULT_FIELDS_CONFIG('r/s'),
                options: TIMESERIES_DEFAULT_OPTIONS,
                transformations: [
                    filterByRefId('TPS')
                ],
            })
    ]
}


export default function SystemDashboard(system, apiList) {
    const seq = new Sequence();
    const header = TextPanel(seq, `# Дашбор для ${system.name}`, { x: 0, y: 0, w: 25, h: 2 });
    const panels = [];
    let y = 2;

    for (const api of apiList ?? []) {
        const panelText = TextPanel(seq, `Интефрейс ${api.name}`, { x: 0, y: y, h: 2, w: 25 });
        //const apiRow = Row(seq, `Интефрейс ${api.name}`, [], { x: 0, y: y, h: 2, w: 25 })
        y += 2;
        for (const m of api.methods) {
            const methodRow = Row(seq, m.method, [], { x: 1, y: y++, h: 1, w: 24 })
            panels.push(methodRow);
            if( !m.source){
                const noSettingPanel = TextPanel(seq, `Отсутствуют настройки мониторинга API`, { x: 0, y: y, h: 2, w: 25 });
                methodRow.panels.push(noSettingPanel);
                continue;
            }
            const method = {...{},...m, name: m.method};
            const latencyPanels = LatancyPanels(seq, method, m.source, y)
            methodRow.panels.push(...latencyPanels);
            y += 4;
            const errorRatePanels = ErrorRatePanels(seq, method, m.source, y)
            methodRow.panels.push(...errorRatePanels);
            y += 4;
            const rps_panels = rpsPanels(seq, method, m.source, y)
            methodRow.panels.push(...rps_panels);
            
        }
        panels.push(panelText);
    }
    /*
    for (const container of system.containers) {
        const panelText = TextPanel(seq, `Контейнер ${container.name}`, { x: 0, y: y, h: 2, w: 25 });
        y += 2;
        panels.push(panelText);
        for (const it of container.interfaces) {
            const interfaceRow = TextPanel(seq, `Интерфейс ${it.name}`, { x: 1, y: y, h: 2, w: 24 });
            y += 2;
            panels.push(interfaceRow);
            for (const m of it.methods) {
                const methodRow = Row(seq, m.name, [], { x: 1, y: y++, h: 1, w: 24 })
                const latencyPanels = LatancyPanels(seq, m, system.grafanaSource, y)
                methodRow.panels.push(...latencyPanels);
                y += 4;
                const errorRatePanels = ErrorRatePanels(seq, m, system.grafanaSource, y)
                methodRow.panels.push(...errorRatePanels);
                y += 4;
                const rps_panels = rpsPanels(seq, m, system.grafanaSource, y)
                methodRow.panels.push(...rps_panels);
                panels.push(methodRow);
            }
        }
    }*/

    return {
        folderUid: DEFAULT_FOLDER_UID,
        overwrite: true,
        dashboard: {
            uid: `${SYSTEM_UID_PREFIX}${system.code}`,
            title: `Дашборд для ${system.name}`,
            panels: [
                header,
                ...panels
            ]
        }
    }
}