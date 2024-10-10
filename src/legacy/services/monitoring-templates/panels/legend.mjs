const LEGEND_PANEL = (seq)=>({
    "id": seq.next(),
    "gridPos": {
      "h": 2,
      "w": 24,
      "x": 0,
      "y": 0
    },
    "type": "stat",
    "title": "Легенда панелей мониторинга",
    "transformations": [],
    "datasource": {
      "type": "testdata",
      "uid": "2nEi5MhSz"
    },
    "pluginVersion": "8.5.10",
    "fieldConfig": {
      "defaults": {
        "mappings": [
          {
            "options": {
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
            "type": "value"
          },
          {
            "options": {
              "from": 0,
              "result": {
                "color": "orange",
                "index": 2,
                "text": "WARNING"
              },
              "to": 1
            },
            "type": "range"
          },
          {
            "options": {
              "match": "null",
              "result": {
                "color": "yellow",
                "index": 3,
                "text": "NO DATA"
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
              "value": 1
            }
          ]
        },
        "color": {
          "fixedColor": "transparent",
          "mode": "continuous-GrYlRd"
        },
        "max": 1,
        "min": 0
      },
      "overrides": []
    },
    "options": {
      "reduceOptions": {
        "values": true,
        "calcs": [
          "lastNotNull"
        ],
        "fields": "",
        "limit": 5
      },
      "orientation": "auto",
      "textMode": "value_and_name",
      "colorMode": "background",
      "graphMode": "none",
      "justifyMode": "auto",
      "text": {}
    },
    "targets": [
      {
        "csvContent": "state, name\r\n0, В норме\r\n0.5, В зоне повышенного внимания\r\n1, В зоне реагирования\r\nnull, В источнике нет данных\r\n-1, Мониторинг не реализован",
        "datasource": {
          "type": "testdata",
          "uid": "2nEi5MhSz"
        },
        "refId": "A",
        "scenarioId": "csv_content"
      }
    ]
  })

  export default LEGEND_PANEL;