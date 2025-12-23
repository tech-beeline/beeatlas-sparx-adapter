import { GrafanaPanel } from "../../dashboard/panels/index.mjs";

export class LegendPanel extends GrafanaPanel {
    constructor(id, title, template) {
        super();
        Object.assign(this, JSON.parse(template));
        this.id = id;
        if (title) this.title = title;
    }
}

