import { PANEL_DATASOURCE } from "./const.mjs"

export class DescriptionPanel {
    datasource = PANEL_DATASOURCE;

    gridPos = { h: 4, w: 24, x: 0 };
    id;
    options = {
        "content": "Описание",
        "mode": "markdown"
    };
    type = "text";

    constructor(seq, statPanelId, yPos) {
        this.gridPos.y = yPos;
        this.id = seq.next();
        this.targets = [
            {
                datasource: PANEL_DATASOURCE,
                panelId: statPanelId,
                refId: "A"
            }
        ]
    }
}