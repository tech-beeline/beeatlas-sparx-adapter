import { expr } from "../../../../../legacy/services/monitoring-templates/panels/primitive-panels.mjs";
import { GrafanaApiSource } from "../sources/common.mjs";

export class InteractionStat {
    id;
    type = "stat";
    gridPos;
    title;
    datasource;
    options = {
        reduceOptions: {
            values: false,
            calcs: ["lastNotNull"],
            fields: "",
            limit: 3
        },
        orientation: "auto",
        textMode: "value",
        colorMode: "background",
        graphMode: "none",
        justifyMode: "auto",
        text: {}
    };
    targets;
    /**
     * 
     * @param {*} id 
     * @param {*} index 
     * @param {GrafanaApiSource} source 
     * @param {*} yPos 
     */
    constructor(id, index, method, path, source, yPos = 13) {
        this.id = id;
        this.gridPos = { h: 2, w: 1, x: index % 24, y: yPos + Math.floor(index / 23) };
        this.title = `${index + 1}`;
        this.datasource = source.datasource;

        this.targets = [
            source.percentileTarget(method, path, 75),
            source.percentileTarget(method, path, 95),
            source.totalCountTarget(method, path),
            source.errorCountTarget(method, path),
            expr("$A75 * 1", "Latency75"),
            expr("$A95 * 1", "Latency95"),
            expr("$C/$B * 100", "Error"), 
            expr("$B / (60 * 5)", "TPS"),
        ]
    }
}