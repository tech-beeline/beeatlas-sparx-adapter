export const SYSTEMS_HEALTH_HEADER_PANEL = (seq, stage) => ({
  id: seq.next(),
  gridPos: { h: 2, w: 24, x: 0, y: 2 },
  type: "text",
  datasource: { type: "datasource", uid: "grafana" },
  options: {
    mode: "markdown",
    content: `# Состояние здоровья систем участвующих в шаге \"${stage}\"`
  }
})

export const API_STATE_HEADER_PANEL = (seq, stage) => ({
  id: seq.next(),
  gridPos: { h: 2, w: 24, x: 0, y: 12 },
  type: "text",
  datasource: { type: "datasource", uid: "grafana" },
  options: {
    mode: "markdown",
    content: `# Состояние здоровья взаимодействий участвующих в шаге \"${stage}\"`
  }
});


export function createInteractionRowHeader(index, title, { } = {}) {
  return {
    collapsed: false,
    gridPos: { h: 1, w: 24, x: 0, y: 25 },
    id: 10010,
    panels: [],
    title: `${index + 1}. ${title}`,
    type: "row"
  }
}