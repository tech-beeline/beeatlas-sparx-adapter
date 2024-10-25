import { DEFAULT_CSV_CONTENT, GRAFANA_COLOR_MAPPINGS, TEST_DATASOURCE } from "../const.mjs";


const LEGEND_PANEL = (seq, title = "Легенда панелей мониторинга", csvContent = DEFAULT_CSV_CONTENT, gridPos = { "h": 2, "w": 24, "x": 0, "y": 0 }) => ({
  id: seq.next(),
  gridPos: gridPos,
  type: "stat",
  title: title,
  transformations: [],
  datasource: TEST_DATASOURCE,
  fieldConfig: {
    defaults: {
      mappings: GRAFANA_COLOR_MAPPINGS,
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
      max: 1,
      min: 0
    }
  },
  options: {
    reduceOptions: {
      values: true,
      calcs: [
        "lastNotNull"
      ],
      fields: "",
      limit: 6
    },
    orientation: "auto",
    textMode: "value_and_name",
    colorMode: "background",
    graphMode: "none",
    justifyMode: "auto",
    text: {}
  },
  targets: [
    {
      csvContent: csvContent,
      datasource: TEST_DATASOURCE,
      refId: "A",
      scenarioId: "csv_content"
    }
  ]
})

export default LEGEND_PANEL;