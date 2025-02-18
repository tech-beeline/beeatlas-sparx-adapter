import { API_STATE_HEADER_PANEL, SYSTEMS_HEALTH_HEADER_PANEL } from "../../../../legacy/services/monitoring-templates/panels/headers.mjs";
import LEGEND_PANEL from "../../../../legacy/services/monitoring-templates/panels/legend.mjs";
import { expr } from "../../../../legacy/services/monitoring-templates/panels/primitive-panels.mjs";
import Sequence from "../../../../legacy/services/monitoring-templates/sequence.mjs";
import { NotImplemented } from "../../../../utils/errors.mjs";
import { GrafanaRow } from "./panels/call-tree-row.mjs";
import { HEADER_Y_OFFSET, STAT_COLUMNS_COUNT } from "./panels/const.mjs";
import { InteractionRow } from "./panels/index.mjs";
import { MessageHeader } from "./panels/messages-headers.mjs";
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

function parseNumber(s, defaultValue = 0) {
    if (s) {
        s = Number(s?.replace(',', '.'));
        if (!isNaN(s)) return s;
    }
    return defaultValue;
}

export class Interaction {

    title;
    index;
    method;
    path;
    clientCode;
    serverCode;
    methodUID;
    interfaceUID
    count = 0;
    sla;
    source;
    statPanel;
    interactionRow;
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

        if (!messageMethod.name) {
            console.log(messageMethod);
        }

        const [method, path] = messageMethod.name.split(' ').filter(it => it.length);

        this.method = method;
        this.path = path;
        this.sla = {
            rps: parseNumber(message.rps),
            latency: parseNumber(message.latency),
            errorRate: parseNumber(message.error_rate)
        }



        this.statPanel = this.source ? new InteractionStat(
            sequence.next(),
            index,
            method, path,
            this.sla,
            this.source) : this.tbdPanel(sequence, yPos);
    }
    tbdPanel(sequence, yPos) {
        const ret = LEGEND_PANEL(sequence, `${this.index + 1}`, "state", { h: 2, w: 1, x: this.index % 24, y: yPos + Math.floor(this.index / 23) })
        ret.targets.push(expr("-1", "ErrorState"));
        return ret;
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
            if (msg.client_code && msg.server_code && (msg.method || msg.name)) {
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
            gridPos: { h: 1, w: 13 - x, x: x, y: y },
            type: "stat",
            fieldConfig: {
                "defaults": {
                    "mappings": [
                        {
                            "options": {
                                "0": {
                                    "color": "green",
                                    "index": 0,
                                    "text": "OK"
                                },
                                "1": {
                                    "color": "red",
                                    "index": 1,
                                    "text": "CRITICAL"
                                },
                                "-1": {
                                    "color": "#c9c9c9",
                                    "index": 4,
                                    "text": "TBD"
                                }
                            },
                            "type": "value"
                        },
                        {
                            "options": {
                                "from": 0,
                                "result": {
                                    "color": "orange",
                                    "index": 2,
                                    "text": "WARNING"
                                },
                                "to": 1
                            },
                            "type": "range"
                        },
                        {
                            "options": {
                                "match": "null",
                                "result": {
                                    "color": "yellow",
                                    "index": 3,
                                    "text": "NO DATA"
                                }
                            },
                            "type": "special"
                        }
                    ],
                    thresholds: {
                        "mode": "absolute",
                        "steps": [
                            {
                                "color": "green",
                                "value": null
                            },
                            {
                                "color": "red",
                                "value": 1
                            }
                        ]
                    },
                    color: {
                        fixedColor: "transparent",
                        mode: "continuous-GrYlRd"
                    },
                    displayName: `${message.interaction.title}`,
                    "max": 1,
                    "min": 0
                }
            },
            datasource: {
                type: "datasource",
                uid: "-- Dashboard --"
            },
            options: {
                "reduceOptions": {
                    "values": false,
                    "calcs": [
                        "lastNotNull"
                    ],
                    "fields": "",
                    "limit": 3
                },
                "orientation": "auto",
                "textMode": "value_and_name",
                "colorMode": "value",
                "graphMode": "none",
                "justifyMode": "auto",
                "text": {
                    "titleSize": 14,
                    "valueSize": 18
                }
            },
            targets: [
                {
                    datasource: {
                        "type": "datasource",
                        "uid": "-- Dashboard --"
                    },
                    panelId: message.interaction.statPanel.id,
                    refId: "A"
                }
            ],
            transformations: [
                {
                    id: "filterByRefId",
                    options: {
                        include: "LatencyState|ErrorState|State"
                    }
                },
                {
                    id: "reduce",
                    options: {
                        includeTimeField: false,
                        mode: "reduceFields",
                        reducers: [
                            "lastNotNull"
                        ]
                    }
                },
                {
                    id: "concatenate",
                    options: {}
                },
                {
                    id: "calculateField",
                    options: {
                        alias: "",
                        binary: {
                            left: "LatencyState 1",
                            reducer: "sum",
                            right: "LatencyState 2"
                        },
                        mode: "reduceRow",
                        reduce: {
                            include: [],
                            reducer: "max"
                        },
                        replaceFields: true
                    }
                }
            ]
        }
    }

    buildSequenceRows(messages, depth = 0, order = 2) {
        const ret = [];
        const proccessedInteractions = {};
        for (const m of messages) {
            if (m.interaction) {
                if (proccessedInteractions[m.interaction.title])
                    continue;

                ret.push(this.messagePanel(m, depth, order++));
                proccessedInteractions[m.interaction.title] = true;
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
        let messages = this.messages;
        if (messages.length === 1 && !messages[0].client_code)
            messages = messages[0].children;

        const sequencePanels = [new MessageHeader(this.panelSequence.next(), 1), ...this.buildSequenceRows(messages)];

        const messagesOffset = HEADER_Y_OFFSET + Math.floor(interactions.length / STAT_COLUMNS_COUNT);
        const interactionsOffset = messagesOffset + sequencePanels.length + 1;

        const interactionPanels = interactions.map((it, i) => it.source ? new InteractionRow(this.panelSequence, it.title, it.statPanel.id, interactionsOffset + i * 15) :
            new GrafanaRow(interactionsOffset + i * 15, it.title, [LEGEND_PANEL(this.panelSequence, "Нет настроек источников данных для получения метрик", "state,name\r\n-1,TBD")])
        )

        return [
            this.legendPanel,
            this.systemHealthPanel,
            this.interactionHeaderPanel,
            ...interactions.map(it => it.statPanel),
            new GrafanaRow(messagesOffset,
                "Sequence состояний интерфейсных соглашений",
                sequencePanels),
            ...interactionPanels
        ];
    }
}