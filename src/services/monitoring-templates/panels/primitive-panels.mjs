import Sequence from "../sequence.mjs"

function getId(seq) {
    return seq instanceof Sequence ? seq.next() : seq
}
export function TextPanel(seq, content, gridPos) {
    return {
        id: getId(seq),
        gridPos: gridPos,
        type: "text",
        datasource: { type: "datasource", uid: "grafana" },
        options: {
            mode: "markdown",
            content: content
        }
    }
}

export function Row(seq, title, panels, gridPos) {
    return {
        collapsed: true,
        gridPos: gridPos,
        id: getId(seq),
        panels: panels ?? [],
        title: `${title}`,
        type: "row"
    }
};



export function expr(exp, ref, type = "math") {
    return {
        datasource: {
            type: "__expr__",
            uid: "__expr__"
        },
        expression: exp,
        hide: false,
        refId: ref, type: type
    }
}

export function DashboardTarget(panelId) {
    return {
        datasource: {
            type: "datasource",
            uid: "-- Dashboard --"
        },
        panelId: panelId,
        refId: "A"
    }
}

export const DASHBOARD_SOURCE = {
    type: "datasource",
    uid: "-- Dashboard --"
}

/**
 * 
 * @param {String|Array} includeValues 
 * @returns 
 */
export function filterByRefId(includeValues) {
    includeValues = Array.isArray(includeValues) ? includeValues.join('|') : includeValues;
    return {
        id: "filterByRefId",
        options: {
            include: includeValues
        }
    }
}

export const REDUCE_LAST_NOT_NULL = {
    id: "reduce",
    options: {
        includeTimeField: false,
        mode: "reduceFields",
        reducers: ["lastNotNull"]
    }
};

export function calculateFieldMax(include) {
    return {
        id: "calculateField",
        options: {
            mode: "reduceRow",
            reduce: {
                include: include ?? [],
                reducer: "max"
            },
            replaceFields: true
        }
    }
}

export const DEFAULT_MAPPINGS = [
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
            },
            "-2": {
                color: "gray",
                index: 5,
                text: "NO Threshold"
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
]
export const STAT_DEFAULT_OPTIONS = {
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
}

export const STAT_DEFAULT_FIELD_CONFIG= (name) =>( {
    defaults: {
        mappings: DEFAULT_MAPPINGS,
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
            fixedColor: "transparent",
            mode: "continuous-GrYlRd"
        },
        displayName: name,
        "max": 1,
        "min": 0
    },
    "overrides": []
});
export const TIMESERIES_DEFAULT_OPTIONS = {
    legend: {
        calcs: [
            "last"
        ],
        displayMode: "table",
        placement: "right"
    },
    tooltip: {
        mode: "single",
        sort: "none"
    }
}

export const TIMESERIES_DEFAULT_FIELDS_CONFIG = (unit) => ({
    defaults: {
        color: {
            mode: "palette-classic",
            seriesBy: "last"
        },
        custom: {
            axisLabel: "",
            axisPlacement: "auto",
            barAlignment: 0,
            drawStyle: "line",
            fillOpacity: 0,
            gradientMode: "none",
            hideFrom: {
                legend: false,
                tooltip: false,
                viz: false
            },
            lineInterpolation: "smooth",
            lineStyle: {
                fill: "solid"
            },
            lineWidth: 1,
            pointSize: 5,
            scaleDistribution: {
                type: "linear"
            },
            showPoints: "never",
            spanNulls: false,
            stacking: {
                group: "A",
                mode: "none"
            },
            thresholdsStyle: {
                mode: "area"
            }
        },
        mappings: [],
        thresholds: {
            mode: "absolute",
            steps: [
                {
                    color: "transparent",
                    value: null
                },
                {
                    color: "dark-red",
                    value: 0.5
                }
            ]
        },
        unit: unit
    },
    overrides: []
})

export function statPanel(id, title, datasource, targets, additionalFields) {
    const { gridPos, transformations, fieldConfig, options } = additionalFields ?? {};

    return {
        id: id instanceof Sequence ? id.next() : id instanceof Function ? id() : id,
        gridPos: gridPos,
        type: "stat",
        title: title,
        transformations: transformations ?? [],
        datasource: datasource,
        fieldConfig: fieldConfig,
        options: options,
        targets: targets
    }
}

export function timeseries(id, title, datasource, targets, additionalFields) {
    const { gridPos, transformations, fieldConfig, options } = additionalFields ?? {};
    return {
        id: id instanceof Sequence ? id.next() : id instanceof Function ? id() : id,
        gridPos: gridPos,
        type: "timeseries",
        title: title,
        transformations: transformations ?? [],
        datasource: datasource,
        fieldConfig: fieldConfig,
        options: options,
        targets: targets
    }
}
