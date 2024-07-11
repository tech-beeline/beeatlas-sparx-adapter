export const SYSTEMS_HEALTH_HEADER_PANEL = {
    "id": 2,
    "gridPos": {
      "h": 2,
      "w": 24,
      "x": 0,
      "y": 2
    },
    "type": "text",
    "datasource": {
      "type": "datasource",
      "uid": "grafana"
    },
    "pluginVersion": "8.5.10",
    "options": {
      "mode": "markdown",
      "content": "# Состояние здоровья систем участвующих в шаге \"${seq_name}\""
    }
  }

  export const API_STATE_HEADER_PANEL = {
    "id": 3,
    "gridPos": {
      "h": 2,
      "w": 24,
      "x": 0,
      "y": 12
    },
    "type": "text",
    "datasource": {
      "type": "datasource",
      "uid": "grafana"
    },
    "pluginVersion": "8.5.10",
    "options": {
      "mode": "markdown",
      "content": "# Состояние здоровья взаимодействий участвующих в шаге \"${seq_name}\""
    }
  }


  export function createInteractionRowHeader( index, title, {} = {}){
    return {
      "collapsed": false,
      "gridPos": {
        "h": 1,
        "w": 24,
        "x": 0,
        "y": 25
      },
      "id": 10010,
      "panels": [],
      "title": `${index+1}. ${title}`,
      "type": "row"
    }
  }