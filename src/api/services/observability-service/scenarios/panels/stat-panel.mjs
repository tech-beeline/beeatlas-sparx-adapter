import { NotImplemented } from "../../../../../utils/errors.mjs";
import { ScenarioMessage } from "../../../../model/index.mjs";
import { LegendPanel } from "./legend-panel.mjs";
import { GrafanaPanel, expr } from "../../dashboard/panels/index.mjs";
import { formatQuery } from "../../dashboard/scenario-dashboard-builder.mjs";
import { messageTitle } from "../../utils.mjs";



export class ScenarioStatPanel extends GrafanaPanel {
    /**
     * 
     * @param {number} id
     * @param {ScenarioMessage} message 
     * @param {string} title 
     * @param {string} template 
     */
    constructor(id, message, title, template) {
        super();

        if (!template) throw Error("template is null");
        if (!message.metricSource) throw Error("msg.metricSource is null")

        Object.assign(this, JSON.parse(template));
        this.id = id;

        this.title = title;
        this.fieldConfig.defaults.displayName = messageTitle(message);

        const [http_method, path] = message.method.name.split(' ').filter(it => it.length);
        /**@type {GrafanaPanel} */
        const panel_template = message.metricSource.template?.panels[0];

        if (!panel_template)
            throw Error(`${message.method?.name}: No template panel found on ${JSON.stringify(message.metricSource)}`);

        this.datasource = panel_template.datasource;
        for (const t of panel_template.targets) {
            const stat_target = this.targets.find(st => st.refId == t.refId);
            if (stat_target) {
                Object.assign(stat_target, t);
                if (t.expr) {
                    stat_target.expr = formatQuery(t.expr, path, http_method, message.client_code);
                }
                if (t.query) {
                    stat_target.query = formatQuery(t.query, path, http_method, message.client_code)
                }
                if (t.rawSql)
                    stat_target.rawSql = formatQuery(t.rawSql, path, http_method, message.client_code);
            }
        }
        let { rps, latency, error_rate } = message.sla ?? {};
        if (rps == null) rps = -1;
        if (latency == null) latency = -1;
        if (error_rate == null) error_rate = -1;

        for (const t of this.targets.filter(t => t.expression === '$RPS')) {
            t.expression = rps.toString();
        }

        for (const t of this.targets.filter(t => t.expression === '$LATENCY')) {
            t.expression = latency.toString();
        }


        for (const t of this.targets.filter(t => t.expression === '$ERROR_RATE')) {
            t.expression = error_rate.toString();
        }
    }
}

export class TBDStatPanel extends LegendPanel {
    /**
     *
     */
    constructor(id, title, template) {
        super(id, title, template);
        this.targets[0] && (this.targets[0].csvContent = "state");
        this.targets.push(expr("-1", "ErrorState"));
    }
}