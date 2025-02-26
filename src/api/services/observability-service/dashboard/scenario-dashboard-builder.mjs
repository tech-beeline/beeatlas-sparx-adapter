import { API_STATE_HEADER_PANEL, SYSTEMS_HEALTH_HEADER_PANEL } from "../../../../legacy/services/monitoring-templates/panels/headers.mjs";
import LEGEND_PANEL from "../../../../legacy/services/monitoring-templates/panels/legend.mjs";
import { expr } from "../../../../legacy/services/monitoring-templates/panels/primitive-panels.mjs";
import Sequence from "../../../../legacy/services/monitoring-templates/sequence.mjs";
import { NotImplemented } from "../../../../utils/errors.mjs";
import { GrafanaRow } from "./panels/call-tree-row.mjs";
import { uriRegex } from "./sources/common.mjs";

const formatTitle = (msg) => `${msg.client_code} - ${msg.server_code}${msg.stereotype ? ` ${msg.stereotype}` : ""}: ${msg.method?.name ?? msg.name}`;

const updateTargetsRef = (panel, id) => {
    panel.targets.forEach(t => t.panelId = id)
}


export function formatQuery(template, uri, method) {
    const uri_regex = uriRegex(uri);

    let variables = {
        URI_REQEX: uri_regex, "URI_REQEX:raw": uri_regex,
        //uri: uri, 
        URI: uri,
        //method: method, 
        METHOD: method,
        //uri_regex: uri_regex, 
    };

    let ret = template;
    for (let v in variables) {
        ret = ret.replaceAll("${" + v + "}", variables[v]).replaceAll(`$${v}`, variables[v]);
    }
    return ret;
}

class StatPanel {
    id;
    datasource;
    targets;
}

export class SecnarioDashboardBuilder {
    /**
     * @type {{statTemplate,messageHeaderTemplate, messageTemplate, interactionPanelTemplate}}
     */
    template;
    statTemplateJSON;
    messageTemplateJSON;
    interactionRowTemplateJSON;
    idSequence = new Sequence();
    interactionsStatPanels = {};
    lastMessageIndex = 0;
    /**
     *
     */
    constructor(template) {
        if (!template) throw Error('Scenario dashbord template is not specified');
        this.template = template;
        this.messageTemplateJSON = JSON.stringify(template.messageTemplate);
        this.interactionRowTemplateJSON = JSON.stringify(template.interactionPanelTemplate);
        this.statTemplateJSON = JSON.stringify(template.statTemplate);
    }

    getOrder() {
        return Object.values(this.interactionsStatPanels).length + 1;
    }

    buildInteractionRow(statPanel) {
        const panels = JSON.parse(this.interactionRowTemplateJSON);
        for (const p of panels) {
            updateTargetsRef(p, statPanel.id);
            p.id = this.idSequence.next();
        }
        return new GrafanaRow(0, statPanel.getTitle(), panels);
    }

    createStatPanel(message, order) {
        if (!message.source) {
            const tbdStatPanel = LEGEND_PANEL(this.idSequence, `${order}`, "state")
            tbdStatPanel.targets.push(expr("-1", "ErrorState"));
            return tbdStatPanel;
        }

        const [method, path] = message.method.name.split(' ').filter(it => it.length);

        const ret = JSON.parse(this.statTemplateJSON);

        const apiTemplate = message.source.apiMetricTemplate;
        if (!apiTemplate) throw Error(`api-metric-template not specified for ${message.method.name}`);
        if (!apiTemplate.panels?.length) throw Error(`No template panel found on ${apiTemplate.title}`);
        const panelTemplate = apiTemplate.panels[0];

        ret.datasource = panelTemplate.datasource;

        for (const t of panelTemplate.targets) {
            const target = ret.targets.find(tt => tt.refId == t.refId);
            if (target) {
                Object.assign(target, t);
                if (t.expr) {
                    target.expr = formatQuery(t.expr, path, method);
                }
                if (t.query) {
                    target.query = formatQuery(t.query, path, method)
                }
            }
        }

        for (const t of ret.targets.filter(t => t.expression === '$ERROR_RATE')) {
            t.expression = message.method?.error_rate?.toString() ?? "0";
        }

        for (const t of ret.targets.filter(t => t.expression === '$LATENCY')) {
            t.expression = message.method?.latency?.toString() ?? "0";
        }

        for (const t of ret.targets.filter(t => t.expression === '$RPS')) {
            t.expression = message.method?.rps?.toString() ?? "0";
        }

        ret.title = `${order}`;
        console.log()
        //console.log(message.source);
        return ret;
    }

    buildStatPanel(message, methodSources) {
        const order = this.getOrder();
        message.method = message.method ?? { name: message.name, operation_guid: message.operation_guid }

        message.source = methodSources[message.method.operation_guid]
        /**
         * @type {StatPanel}
         */
        const statPanel = this.createStatPanel(message, order)
        statPanel.order = () => order;
        statPanel.id = this.idSequence.next();
        statPanel.getTitle = () => `${order}. ${formatTitle(message)}`;
        return statPanel;
    }

    messagesHeader() {
        const panels = this.template.messageHeaderTemplate.map(p => ({ ...{}, ...p }));
        for (const p of panels) {
            p.gridPos.y = 0;
            p.id = this.idSequence.next();
        }
        return panels;
    }

    messagePanels(statPanel, title) {
        const ret = JSON.parse(this.messageTemplateJSON);
        for (const p of ret) {
            updateTargetsRef(p, statPanel.id);
            p.id = this.idSequence.next();
        }
        if (ret[0]?.fieldConfig?.defaults?.displayName) ret[0].fieldConfig.defaults.displayName = title;
        return ret;
    }

    buildMessagesPanels(messages, methodSources, deep = 0) {
        const ret = []
        const msgMap = {};
        for (const msg of messages) {
            if (msg.client_code && msg.server_code && (msg.method || msg.name)) {
                const title = formatTitle(msg);
                if (msgMap[title]) continue;
                const statPanel = msgMap[title] = (
                    this.interactionsStatPanels[title] ?? (
                        this.interactionsStatPanels[title] = this.buildStatPanel(msg, methodSources))
                );
                const msgPanels = this.messagePanels(statPanel, `${statPanel.order()}. ${title}`)

                for (const p of msgPanels) {
                    p.gridPos.y = this.lastMessageIndex++;
                }
                msgPanels[0].gridPos.x = deep;
                msgPanels[0].gridPos.w = msgPanels[0].gridPos.w - deep;

                ret.push(...msgPanels);
            }

            if (msg.children) {
                const chld = this.buildMessagesPanels(msg.children, methodSources, deep + 1);
                ret.push(...chld);
            }
        }
        return ret;
    }


    layoutPanels(interactionStatPanels, messagesRow, interactionDetailsRows) {
        let yPos = 13;
        let order = 0;
        for (const p of interactionStatPanels) {
            p.gridPos = { x: order % 24, y: yPos + order / 24, h: 2, w: 1 }
            order++;
        }

        messagesRow.gridPos.y = Math.floor(yPos + order / 24 + 1);
        let interactionRowPos = yPos
        for (const p of messagesRow.panels) {
            p.gridPos.y = messagesRow.gridPos.y + p.gridPos.y;
            interactionRowPos = p.gridPos.y + 1;
        }

        for (const row of interactionDetailsRows) {
            row.gridPos.y = interactionRowPos++;
            let lastYPos = interactionRowPos;
            for (const p of row.panels) {
                p.gridPos.y = row.gridPos.y + p.gridPos.y;
                lastYPos = p.gridPos.y + p.gridPos.h;
            }
            interactionDetailsRows += lastYPos;
        }
    }


    buildScenarioDashboard(scenario, methodSources) {

        const legendPanel = LEGEND_PANEL(this.idSequence);
        const systemHealthPanel = SYSTEMS_HEALTH_HEADER_PANEL(this.idSequence, scenario.info.name);
        const interactionHeaderPanel = API_STATE_HEADER_PANEL(this.idSequence, scenario.info.name);

        const messages = (scenario.callTrace.length === 1 && !scenario.callTrace[0].client_code) ?
            scenario.callTrace[0].children : scenario.callTrace;


        const messagesPanels = [...this.messagesHeader(),
        ...this.buildMessagesPanels(messages, methodSources)
        ];
        const messagesRow = new GrafanaRow(0,
            "Sequence состояний интерфейсных соглашений",
            messagesPanels
        );

        const interactionStatPanels = Object.values(this.interactionsStatPanels);

        const interactionDetailsPanels = interactionStatPanels.map(s => this.buildInteractionRow(s));

        this.layoutPanels(interactionStatPanels, messagesRow, interactionDetailsPanels);

        return [
            legendPanel,
            systemHealthPanel,
            interactionHeaderPanel,
            ...interactionStatPanels,
            messagesRow,
            ...interactionDetailsPanels
        ]
    }
}