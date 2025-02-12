export class MessageHeader {

    datasource = {
        "type": "datasource",
        "uid": "grafana"
    };
    id;
    gridPos = {
        "h": 1,
        "w": 13,
        "x": 0,
        "y": 13
    };
    options = {
        "mode": "markdown",
        "code": {
            "language": "plaintext",
            "showLineNumbers": false,
            "showMiniMap": false
        },
        "content": ""
    };
    type = "text";
    /**
     *
     */
    constructor(id, y) {
        this.id=id;
        this.gridPos.y = y;
    }
}