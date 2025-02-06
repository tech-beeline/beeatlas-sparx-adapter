export class GrafanaRow {
    collapsed = true;
    gridPos;//: { h: 1, w: 24, x: 0, y: y },
    //id: headerId,
    panels;
    title;
    type = "row"
    constructor(yPos, title, panels) {
        this.gridPos = { h: 1, w: 24, x: 0, y: yPos };
        this.title = title
        this.panels = panels;
    }
}