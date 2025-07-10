import { NotImplemented } from "../../../../utils/errors.mjs";
import { ScenarioMessage } from "../../../model/index.mjs";
import { GrafanaRow } from "../dashboard/panels/call-tree-row.mjs";
import {
    API_STATE_HEADER_PANEL,
    GrafanaPanel,
    SYSTEMS_HEALTH_HEADER_PANEL,
    updateTargetsRef
} from "../dashboard/panels/index.mjs";
import { messageTitle } from "../utils.mjs";
import { LegendPanel } from "./panels/legend-panel.mjs";
import {
    ScenarioStatPanel,
    ScenarioDetailsRow,
    TBDStatPanel
} from "./panels/index.mjs";
import { ScenarioDashboardTemplate } from "./panels/template.mjs";
import { ScenarioSequenceDTO } from "../../../../client/src/model/sequence.mjs";


export default class ScenarioDashboard {
    #template
    #messagesTemplateJSON;
    #statTemplateJSON;
    #detailsTemplateJSON;
    #legendTemplateJSON;
    tags;
    uid;
    title;
    panels = [];
    #id = 1;
    /**@type {{version:number}} */
    meta;

    /**
     * 
     * @param {ScenarioSequenceDTO} scenario 
     * @param {*} current 
     * @param {ScenarioDashboardTemplate} template 
     */
    constructor(scenario, current, template) {
        if (current) {
            Object.assign(this, current);
            if (this.meta) this.meta.version = null;
        }
        if (scenario.code) this.uid = scenario.code.replaceAll(/[\{\}]/g, "");
        this.title = scenario.name;
        this.#template = template;
        this.#messagesTemplateJSON = JSON.stringify(template.messageTemplate);
        this.#statTemplateJSON = JSON.stringify(template.statTemplate);
        this.#legendTemplateJSON = JSON.stringify(template.legendPanel);
        this.#detailsTemplateJSON = JSON.stringify(template.interactionPanelTemplate);


        this.get_id = this.get_id.bind(this);
        for (const p of this.#template.messageHeaderTemplate) {
            p.id = this.#id++;
            p.gridPos.y = 0;
        }
        this.#messsages.push(this.#template.messageHeaderTemplate);
        this.addMessages(scenario.sequence);
        this.layout();
    }
    get_id() {
        return this.#id++;
    }

    /**@type {GrafanaPanel[][]} */
    #messsages = [];
    #interactions = {};
    get order() {
        return Object.keys(this.#interactions).length + 1;
    }
    /**
     * 
     * @param {ScenarioMessage} msg 
     */
    #stat(msg) {
        const ret = msg.metricSource
            ? new ScenarioStatPanel(this.#id++, msg, this.order.toString(), this.#statTemplateJSON)
            : new TBDStatPanel(this.#id++, this.order.toString(), this.#legendTemplateJSON);
        const displayName = `${this.order}. ${messageTitle(msg)}`;
        if (ret?.fieldConfig?.defaults) ret.fieldConfig.defaults.displayName = displayName;
        ret.description = displayName;
        return ret;
    }

    #setInteraction(msg) {
        const title = messageTitle(msg);
        if (!this.#interactions[title]) {
            const order = this.order;
            const interaction = this.#interactions[title] = {
                title: `${Object.keys(this.#interactions).length + 1}. ${title}`,
                stat: this.#stat(msg)
            };
            interaction.details = new ScenarioDetailsRow(
                this.get_id,
                interaction.title,
                interaction.stat.id,
                this.#detailsTemplateJSON);
        }
        return this.#interactions[title];
    }


    #addMessagesPanels(msg, deep) {
        const interaction = this.#setInteraction(msg);
        /**@type {GrafanaPanel[]} */
        const panels = JSON.parse(this.#messagesTemplateJSON);

        for (const panel of panels) {
            updateTargetsRef(panel, interaction.stat.id);
            panel.id = this.#id++;
            panel.gridPos.y = this.#messsages.length;
        }
        panels[0].gridPos.x = deep;
        panels[0].gridPos.w -= deep;

        this.#messsages.push(panels);

        if (panels[0]?.fieldConfig?.defaults?.displayName) panels[0].fieldConfig.defaults.displayName = interaction.title;
        return panels;
    }

    /**
     * 
     * @param {ScenarioMessage[]} messages 
     * @param {*} deep 
     */
    addMessages(messages, deep = 0) {
        const messages_map = {};
        for (const msg of messages) {
            const title = messageTitle(msg);
            if (messages_map[title]) continue;

            messages_map[title] = this.#addMessagesPanels(msg, deep);

            if (msg.sequence) {
                this.addMessages(msg.sequence, deep + 1);
            }
        }
    }

    layout() {
        const api_header = API_STATE_HEADER_PANEL(this.get_id, this.title);
        this.panels = [
            new LegendPanel(this.#id++, null, this.#legendTemplateJSON),
            SYSTEMS_HEALTH_HEADER_PANEL(this.get_id, this.title),
            api_header
        ];

        let y_pos = api_header.gridPos.y + 1;
        let order = 0;
        for (const title in this.#interactions) {
            /**@type {{ stat: GrafanaPanel, details: GrafanaRow}} */
            const interaction = this.#interactions[title];
            interaction.stat.gridPos = { x: order % 24, y: y_pos + Math.floor(order / 24), h: 2, w: 1 };
            order++;
            this.panels.push(interaction.stat);
        }
        const messages_row = new GrafanaRow(y_pos + 1 + Math.floor(order / 24), "Последовательность вызовов", []);
        messages_row.collapsed = false;
        this.panels.push(messages_row);
        
        y_pos = messages_row.gridPos.y + 1;

        for (const m of this.#messsages) {
            for (const p of m) {
                p.gridPos.y = y_pos;
                this.panels.push(p);
            }
            y_pos++;
        }

        for (const title in this.#interactions) {
            /**@type {{ stat: GrafanaPanel, details: GrafanaRow}} */
            const { details } = this.#interactions[title];
            details.gridPos.y = y_pos;
            for (const p of details.panels) {
                p.gridPos.y += details.gridPos.y;
                y_pos = Math.max(p.gridPos.y + p.gridPos.h, y_pos);
            }
            y_pos++;
            this.panels.push(details);
        }

    }
}