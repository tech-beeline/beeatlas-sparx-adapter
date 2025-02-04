import { API_STATE_HEADER_PANEL, SYSTEMS_HEALTH_HEADER_PANEL } from "../../../../legacy/services/monitoring-templates/panels/headers.mjs";
import LEGEND_PANEL from "../../../../legacy/services/monitoring-templates/panels/legend.mjs";
import Sequence from "../../../../legacy/services/monitoring-templates/sequence.mjs";
import { NotImplemented } from "../../../../utils/errors.mjs";
import { GrafanaRow } from "./panels/call-tree-row.mjs";
import { HEADER_Y_OFFSET, STAT_COLUMNS_COUNT } from "./panels/const.mjs";
import { InteractionRow } from "./panels/interaction-row.mjs";
import { InteractionStat } from "./panels/stat-panel.mjs";

const formatTitle = (msg) => `${msg.client_code} - ${msg.server_code}${msg.stereotype ? ` ${msg.stereotype}` : ""}: ${msg.method?.name ?? msg.name}`


class IneractionStatPanel {
    /**
     * 
     * @param {Interaction} interaction 
     */
    constructor(interaction) {
    }
}
export class Interaction {
    rps;
    latency;
    error_rate;
    title;
    index;
    method;
    path;
    clientCode;
    serverCode;
    methodUID;
    interfaceUID
    count = 0;
    statPanel;
    interactionPanel;
    source;
    /**
     *
     */
    constructor(message, index, sources, sequence) {
        const messageMethod = message.method ?? { name: message.name, operation_guid: message.operation_guid }

        const yPos = 13;

        this.index = index;
        this.clientCode = message.client_code;
        this.serverCode = message.server_code;
        this.methodUID = messageMethod.operation_guid;
        this.source = sources[this.methodUID];

        this.interfaceUID = messageMethod.api_guid;
        this.title = `${index + 1}. ${formatTitle(message)}`

        const [method, path] = messageMethod.name.split(' ').filter(it => it.length);

        this.method = method;
        this.path = path;
        if (message.rps) this.rps = Number(message.rps?.replace(',', '.'));
        if (message.latency) this.latency = Number(message.latency?.replace(',', '.'));
        if (message.error_rate) this.error_rate = Number(message.error_rate?.replace(',', '.'));

        this.statPanel = this.source ? new InteractionStat(
            sequence.next(),
            index,
            method, path,
            this.source) :
            LEGEND_PANEL(sequence, `${index + 1}`, "state, name\r\n-1, TDB", { h: 2, w: 1, x: index % STAT_COLUMNS_COUNT, y: yPos + Math.floor(index / 23) });
    }
}

export class ScenarioDashboard {
    scenario;
    panelSequence = new Sequence();
    interactions = { count: 0 };
    messages = [];
    legendPanel;
    systemHealthPanel;
    interactionHeaderPanel;
    sources;
    /**
     *
     */
    constructor(scenario, sources) {
        this.scenario = scenario;
        this.sources = sources;
        this.messages = scenario.callTrace;
        this.legendPanel = LEGEND_PANEL(this.panelSequence);
        this.systemHealthPanel = SYSTEMS_HEALTH_HEADER_PANEL(this.panelSequence, scenario.info.name);
        this.interactionHeaderPanel = API_STATE_HEADER_PANEL(this.panelSequence, scenario.info.name);
        this.processMessages(this.messages);
        delete this.interactions.count;
    }

    processMessages(messages) {
        for (const msg of messages) {
            if (msg.client_code && msg.server_code) {
                const title = formatTitle(msg);
                msg.interaction = this.interactions[title] ?? (this.interactions[title] = new Interaction(
                    msg, this.interactions.count++,
                    this.sources,
                    this.panelSequence));
                msg.interaction.count++;
            }

            if (msg.children) {
                this.processMessages(msg.children)
            }
        }
    }

    messagePanel(message, x, y) {
        return {
            id: this.panelSequence.next(),
            title: message.interaction.title,
            gridPos: { h: 1, w: 19 - x, x: x, y: y },
            type: "stat",
            datasource: {
                type: "datasource",
                uid: "-- Dashboard --"
            }
        }
    }

    buildSequenceRows(messages, depth = 0, order = 1) {
        const ret = [];
        for (const m of messages) {
            if (m.interaction) {
                ret.push(this.messagePanel(m, depth, order++));
            }

            if (m.children?.length) {
                const chld = this.buildSequenceRows(m.children, depth + 1, order);
                if (chld.length) {
                    order += chld.length;
                    ret.push(...chld);
                }
            }
        }
        return ret;
    }

    getPanels() {
        //const ss = Object.values(this.interactions).map(it => it.statPanel);
        const interactions = Object.values(this.interactions);
        const sequencePanels = this.buildSequenceRows(this.messages);

        const messagesOffset = HEADER_Y_OFFSET + Math.floor(interactions.length / STAT_COLUMNS_COUNT);
        const interactionsOffset = messagesOffset + sequencePanels.length + 1;

        const interactionPanels = interactions.map((it, i) => new InteractionRow(it, interactionsOffset + i * 15))

        return [
            this.legendPanel,
            this.systemHealthPanel,
            //this.interactionHeaderPanel,
            new GrafanaRow(HEADER_Y_OFFSET,
                `Состояние здоровья взаимодействий участвующих в шаге \"${this.scenario.info.name}\"`
                , interactions.map(it => it.statPanel)
            ),
            new GrafanaRow(messagesOffset,
                "Sequence состояний интерфейсных соглашений",
                sequencePanels),
            ...interactionPanels
        ];
    }
}