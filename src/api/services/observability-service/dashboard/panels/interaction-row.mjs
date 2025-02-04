import { GrafanaRow } from "./call-tree-row.mjs";

export class InteractionRow extends GrafanaRow {
    /**
     *
     */
    constructor(it, yPos) {
        super(yPos, it.title);
    }
}