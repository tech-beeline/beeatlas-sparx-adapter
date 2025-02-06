import { GrafanaRow } from "../call-tree-row.mjs";
import { ConsumerLatencyPanel } from "./consumer-latency-panel.mjs";
import { ConsumerSuccessPanel } from "./consumer-success-panel.mjs";
import { DescriptionPanel } from "./description-panel.mjs";
import { ErrorRatePanel } from "./error-rate-panel.mjs";
import { ErrorRateTimeline } from "./error-rate-timeline.mjs";
import { consumerSuccess } from "./interaction-timeseries.mjs";
import { TrafficStatePanel } from "./traffic-state-panel.mjs";
import { TrafficTimeseriesPanel } from "./traffice-timeseries-panel.mjs";

export class InteractionRow extends GrafanaRow {
    /**
     *
     */
    constructor(seq, title, statPanelId, yPos) {
        super(yPos, title);
        this.panels = [
            new ConsumerSuccessPanel(seq, statPanelId, yPos),
            new ConsumerLatencyPanel(seq, statPanelId, yPos),
            new ErrorRatePanel(seq, statPanelId, yPos + 4),
            new ErrorRateTimeline(seq,statPanelId, yPos + 4),
            new TrafficStatePanel(seq, statPanelId, yPos + 6 ),
            new TrafficTimeseriesPanel(seq,statPanelId, yPos + 6),
            new DescriptionPanel(seq,statPanelId, yPos + 10)
        ]
    }
}