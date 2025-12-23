import { NotImplemented } from "../../../../../utils/errors.mjs";
import { GrafanaRow } from "../../dashboard/panels/call-tree-row.mjs";
import { GrafanaPanel, updateTargetsRef } from "../../dashboard/panels/index.mjs";

export class ScenarioDetailsRow extends GrafanaRow {
    constructor(next_id, title, stat_panel_id, template) {
        if (!template) throw Error("template is null");
        if (!stat_panel_id) throw Error("stat_panel_id is null")
            /**@type {GrafanaPanel[]} */
        const panels = JSON.parse(template);
        for (const p of panels) {
            updateTargetsRef(p, stat_panel_id);
            p.id = next_id();
        }
        super(0, title, panels);
    }
}