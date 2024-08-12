function row(id, title, index, panels) {
  return {
    "collapsed": true,
    "gridPos": {
      "h": 1,
      "w": 24,
      "x": 0,
      "y": 25 + index * 15
    },
    id: id,
    "panels": panels ?? [],
    "title": `${title}`,
    "type": "row"
  }
};

function consumerSummary({ index }, y) {
  return {
    "datasource": {
      "type": "datasource",
      "uid": "-- Dashboard --"
    },
    "description": "",
    "fieldConfig": {
      "defaults": {
        "color": {
          "mode": "thresholds"
        },
        "links": [],
        "mappings": [
          {
            "options": {
              "0": {
                "color": "green",
                "index": 1,
                "text": "OK"
              },
              "1": {
                "color": "orange",
                "index": 3,
                "text": "WARN"
              },
              "2": {
                "color": "red",
                "index": 0,
                "text": "CRIT"
              },
              "-1": {
                "color": "transparent",
                "index": 4,
                "text": "No data"
              }
            },
            "type": "value"
          },
          {
            "options": {
              "match": "null+nan",
              "result": {
                "color": "light-yellow",
                "index": 2,
                "text": "N/A"
              }
            },
            "type": "special"
          }
        ],
        "thresholds": {
          "mode": "absolute",
          "steps": [
            {
              "color": "green",
              "value": null
            },
            {
              "color": "red",
              "value": 80
            }
          ]
        }
      },
      "overrides": []
    },
    "gridPos": {
      "h": 5,
      "w": 2,
      "x": 0,
      "y": y ?? (index * 15 + 26)
    },
    "id": 10000 + (index + 1) * 10 + 1,
    "options": {
      "colorMode": "background",
      "graphMode": "none",
      "justifyMode": "center",
      "orientation": "auto",
      "reduceOptions": {
        "calcs": [
          "lastNotNull"
        ],
        "fields": "/^Consumer$/",
        "values": false
      },
      "text": {},
      "textMode": "auto"
    },
    "pluginVersion": "8.5.10",
    "targets": [
      {
        "datasource": {
          "type": "datasource",
          "uid": "-- Dashboard --"
        },
        "panelId": 1001 + index,
        "refId": "A"
      }
    ],
    "transformations": [
      {
        "id": "reduce",
        "options": {
          "includeTimeField": false,
          "mode": "seriesToRows",
          "reducers": [
            "max"
          ]
        }
      },
      {
        "id": "reduce",
        "options": {
          "includeTimeField": false,
          "mode": "reduceFields",
          "reducers": [
            "max"
          ]
        }
      },
      {
        "id": "organize",
        "options": {
          "excludeByName": {
            "Field": true
          },
          "indexByName": {},
          "renameByName": {
            "Max": "Consumer"
          }
        }
      }
    ],
    "type": "stat"
  }
}

function consumerSuccess(seq, interaction, y = 26) {
  return {
    id: seq.next(),
    "gridPos": { h: 4, w: 4, x: 2, y: y + interaction.index * 15 },

    datasource: {
      type: "datasource",
      uid: "-- Dashboard --"
    },
    description: "",
    fieldConfig: {
      defaults: {
        color: {
          "mode": "thresholds"
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
            "options": {
              "from": 0,
              "result": {
                "color": "red",
                "index": 2,
                "text": "<75%"
              },
              "to": 75
            },
            "type": "range"
          }
        ],
        "max": 1,
        "min": 0,
        "thresholds": {
          "mode": "absolute",
          "steps": [
            {
              "color": "red",
              "value": null
            }
          ]
        },
        "unit": "none"
      },
      "overrides": []
    },

    "links": [],
    "options": {
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
    },
    targets: [
      {
        datasource: {
          type: "datasource",
          uid: "-- Dashboard --"
        },
        panelId: interaction.statPanel.id,
        refId: "A"
      }
    ],
    transformations: [
      {
        "id": "filterByRefId",
        "options": {
          "include": "LatencyPercent"
        }
      }
    ],
    type: "stat"
  }
}

function consumerLatency(seq, interaction, y = 26) {
  return {
    id: seq.next(),
    gridPos: { h: 4, w: 18, x: 6, y: y + interaction.index * 15 },
    datasource: {
      type: "datasource",
      uid: "-- Dashboard --"
    },
    "fieldConfig": {
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
    },

    "options": {
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
    },
    "pluginVersion": "8.5.10",
    targets: [
      {
        datasource: {
          type: "datasource",
          uid: "-- Dashboard --"
        },
        panelId: interaction.statPanel.id,
        refId: "A"
      }
    ],
    "transformations": [
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
    ],
    "type": "timeseries"
  }
}

function errorRate(seq, interaction, y = 26) {
  return {
    gridPos: { h: 2, w: 4, "x": 2, "y": y + 4 + interaction.index * 15 },
    id: seq.next(),
    datasource: {
      type: "datasource",
      uid: "-- Dashboard --"
    },
    "fieldConfig": {
      "defaults": {
        "color": {
          "mode": "thresholds"
        },
        "displayName": "Ошибочных запросов",
        "mappings": [],
        "min": 0,
        "noValue": "0",
        "thresholds": {
          "mode": "percentage",
          "steps": [
            {
              "color": "green",
              "value": null
            },
            {
              "color": "orange",
              "value": 1
            },
            {
              "color": "red",
              "value": 100
            }
          ]
        },
        "unit": "percent"
      },
      "overrides": []
    },
    "options": {
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
    },
    "pluginVersion": "8.5.10",
    targets: [
      {
        datasource: {
          type: "datasource",
          uid: "-- Dashboard --"
        },
        panelId: interaction.statPanel.id,
        refId: "A"
      }
    ],
    "transformations": [
      {
        "id": "filterByRefId",
        "options": {
          "include": "ErrorThreshold1|Error"
        }
      },
      {
        "id": "configFromData",
        "options": {
          "configRefId": "ErrorThreshold1",
          "mappings": [
            {
              "fieldName": "ErrorThreshold1",
              "handlerKey": "max"
            }
          ]
        }
      }
    ],
    "type": "stat"
  }
}


function errorTimeline(seq, interaction, y) {
  return {
    gridPos: { h: 2, w: 18, x: 6, y: y + 4 + interaction.index * 15 },
    id: seq.next(),
    datasource: {
      "type": "datasource",
      "uid": "-- Dashboard --"
    },
    targets: [
      {
        "datasource": {
          "type": "datasource",
          "uid": "-- Dashboard --"
        },
        panelId: interaction.statPanel.id,
        refId: "A"
      }
    ],
    "fieldConfig": {
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
    },

    "links": [],
    "maxDataPoints": 100,
    "options": {
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
    },
    "transformations": [
      {
        "id": "filterByRefId",
        "options": {
          "include": "ErrorThreshold1|Error"
        }
      },
      {
        "id": "renameByRegex",
        "options": {
          "regex": "(State)",
          "renamePattern": ""
        }
      },
      {
        "id": "configFromData",
        "options": {
          "applyTo": {
            "id": "byName",
            "options": "Error"
          },
          "configRefId": "ErrorThreshold1",
          "mappings": [
            {
              "fieldName": "ErrorThreshold1",
              "handlerKey": "max"
            }
          ]
        }
      }
    ],
    "type": "state-timeline"
  }
}

function providerHealth(interaction) {
  return {
    "datasource": {
      "type": "datasource",
      "uid": "-- Dashboard --"
    },
    "description": "",
    "fieldConfig": {
      "defaults": {
        "color": {
          "mode": "thresholds"
        },
        "links": [],
        "mappings": [
          {
            "options": {
              "0": {
                "color": "green",
                "index": 1,
                "text": "OK"
              },
              "1": {
                "color": "orange",
                "index": 3,
                "text": "WARN"
              },
              "2": {
                "color": "red",
                "index": 0,
                "text": "CRIT"
              },
              "-1": {
                "color": "transparent",
                "index": 4,
                "text": "No data"
              }
            },
            "type": "value"
          },
          {
            "options": {
              "match": "null+nan",
              "result": {
                "color": "light-yellow",
                "index": 2,
                "text": "N/A"
              }
            },
            "type": "special"
          }
        ],
        "thresholds": {
          "mode": "absolute",
          "steps": [
            {
              "color": "green",
              "value": null
            },
            {
              "color": "red",
              "value": 80
            }
          ]
        }
      },
      "overrides": []
    },
    "gridPos": {
      "h": 5,
      "w": 2,
      "x": 0,
      "y": 31 + interaction.index * 15
    },
    "id": 10014 + interaction.index * 10,
    "options": {
      "colorMode": "background",
      "graphMode": "none",
      "justifyMode": "center",
      "orientation": "auto",
      "reduceOptions": {
        "calcs": [
          "lastNotNull"
        ],
        "fields": "/.*/",
        "values": false
      },
      "textMode": "auto"
    },
    "pluginVersion": "8.5.10",
    "targets": [
      {
        "datasource": {
          "type": "datasource",
          "uid": "-- Dashboard --"
        },
        "panelId": 1002,
        "refId": "A"
      }
    ],
    "transformations": [
      {
        "id": "reduce",
        "options": {
          "reducers": [
            "last"
          ]
        }
      },
      {
        "id": "reduce",
        "options": {}
      },
      {
        "id": "organize",
        "options": {
          "excludeByName": {
            "Field": true
          },
          "indexByName": {},
          "renameByName": {
            "Max": "Provider"
          }
        }
      }
    ],
    "transparent": true,
    "type": "stat"
  }
}

function traffic(seq, interaction, y) {
  return {
    "gridPos": { h: 4, w: 4, x: 2, y: y + 6 + interaction.index * 15 },
    id: seq.next(),
    datasource: {
      type: "datasource",
      uid: "-- Dashboard --"
    },
    targets: [
      {
        datasource: {
          type: "datasource",
          uid: "-- Dashboard --"
        },
        panelId: interaction.statPanel.id,
        "refId": "A"
      }
    ],
    "description": "",
    "fieldConfig": {
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
    },

    "links": [],
    "options": {
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
    },
    "transformations": [
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
              "handlerKey": "max"
            }
          ]
        }
      }
    ],
    "type": "stat"
  }
}

function trafficTimeline(seq, interaction, y) {
  return {
    gridPos: { h: 4, w: 18, x: 6, y: y + 6 + interaction.index * 15 },
    id: seq.next(),
    datasource: {
      type: "datasource",
      uid: "-- Dashboard --"
    },
    targets: [
      {
        datasource: {
          type: "datasource",
          uid: "-- Dashboard --"
        },
        panelId: interaction.statPanel.id,
        refId: "A"
      }
    ],
    fieldConfig: {
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
    },
    "options": {
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
    },
    "transformations": [
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
    ],
    "type": "timeseries"
  }
}

function description(seq, interaction, y) {
  return {
    "datasource": {
      "type": "datasource",
      "uid": "grafana"
    },
    gridPos: { h: 4, w: 24, x: 0, y: y + 10 + interaction.index * 15 },
    id: seq.next(),
    "options": {
      "content": "Описание",
      "mode": "markdown"
    },
    "type": "text"
  };
}
/**
 * 
 * @param {{ title: string, message: string, index:number, count: 0, method: string, path:string }} interaction 
 * @returns 
 */
export default function createInteractionPanels(seq, interaction, y = 0) {
  const rowId = seq.next();
  return [
    row(rowId, `${interaction.index + 1}. ${interaction.title}`, y + interaction.index,
      [
        consumerSuccess(seq, interaction, y), consumerLatency(seq, interaction, y),
        errorRate(seq, interaction, y), errorTimeline(seq, interaction, y),
        traffic(seq, interaction, y), trafficTimeline(seq, interaction, y), description(seq, interaction, y)
        /*
        errorRate(interaction), errorTimeline(interaction),
        traffic(interaction), trafficTimeline(interaction), description(interaction)
        */
      ]),

  ];
}