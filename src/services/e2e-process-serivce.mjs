import { BusinessInteraction } from '../model/e2e-process.mjs';
import Repository from '../utils/ea-repo.mjs'
import applicationService from './application-service.mjs';
import QUERIES from './sql/e2e-process-queries.mjs'

class E2EProcessService {
    /**
     * 
     * @param {Array<{ server_type, message, child_diagram_uid}>} messages 
     */
    buildBusinessInterations(messages, diagram_map) {
        return messages.filter(m => m.server_type === 'MessageEndpoint')
            .sort((a, b) => a.seqno - b.seqno)
            .map(m =>
                new BusinessInteraction({
                    name: diagram_map[m.child_diagram_uid]?.name,
                    uid: m.child_diagram_uid,
                    scenario: diagram_map[m.child_diagram_uid]?.messages
                }));
    }


    buildMessageTree(messages, diagram_map) {
        function searchContext(context, client_id) {
            while (context && context.server_id !== client_id) {
                context = context.parent ? context.parent() : null;
            }
            return context;
        }
        messages = messages.filter(m => m.message != 'use' && m.message != 'use()').sort((a, b) => a.seqno - b.seqno);

        let context = { client_id: 0, server_id: messages[0].client_id, messages: [] };
        let root = context;
        for (let msg of messages) {

            let parent_context = searchContext(context, msg.client_id);

            if (msg.client_id === msg.server_id && !msg.operation_guid) {
                context.messages.push({ type: "internalCall", message: msg.message })
                continue;
            }

            if (!parent_context) {
                (context.failedMessages = context.failedMessages ?? []).push(msg);
                continue;
            }

            if (parent_context.server_id === msg.client_id) {
                let child_diagram = msg.child_diagram_uid && msg.child_diagram_uid != msg.diagram_uid ? diagram_map[msg.child_diagram_uid] : null;

                let new_context = { ...msg, messages: [], parent: () => parent_context, child_diagram_uid: msg.child_diagram_uid ?? undefined }

                if (child_diagram) {
                    child_diagram.parentMessages = child_diagram.parentMessages ?? [];
                    child_diagram.parentMessages.push(new_context)
                }

                parent_context.messages.push(new_context);
                if (msg.client_id !== msg.server_id)
                    context = new_context;
                continue;
            }
            throw Error('not implemented');

        }

        //mergeCallInsideApplication( root.messages);

        return root.messages;
    }
    /**
     * 
     * @param {String} processUID 
     * @returns {Promise<Array>}
     */
    async getProcessMessages(processUID) {
        /**
         * @type {Array<{ message, e2e_uid, diagram_uid, server_id}>}
         */
        let rows = await Repository.queryRows({ text: QUERIES.E2E_MESSAGES_QUERY, values: [processUID] });
        const app_catalog = await applicationService.getApplications()

        let diagram_map = {};
        let application_map = {}

        for (const row of rows) {
            row.validationError = [];
            const server = app_catalog.byObjectId(row.server_id);
            if (server) {
                if (!application_map[server.cmdb]) application_map[server.cmdb] = server;
                row.server = { "$ref": `#/applications/${server.cmdb}` }
                row.server_id = server.component_id;
            }
            const client = app_catalog.byObjectId(row.client_id);
            if (client) {
                if (!application_map[client.cmdb]) application_map[client.cmdb] = client;
                row.client = { "$ref": `#/applications/${client.cmdb}` };
                row.client_id = client.component_id
            }

            if (server && !row.operation_guid) {
                row.validationError.push(`Сообщение не связано с методом интерфейса (operation_guid = null)`)
            }

            (diagram_map[row.diagram_uid] = diagram_map[row.diagram_uid] ?? { name: row.diagram, messages: [] }).messages.push(row);
        }

        for (const uid in diagram_map) {
            if (uid === processUID) continue;

            diagram_map[uid].messages = this.buildMessageTree(diagram_map[uid].messages, diagram_map)
        }

        for (const uid in diagram_map) {
            if (uid === processUID) continue;

            for (const parent_message of diagram_map[uid].parentMessages ?? []) {
                try {
                    if (parent_message.server_type === 'MessageEndpoint') {
                        throw Error('Ссылки на ref обьекты не поддерживаются')
                    }
                    if (!parent_message.operation_guid) {
                        throw Error(`Нельзя корректно подключить диаграмму [<a target="_blank" href="https://ms-seaapp001.bee.vimpelcom.ru:83?m=1&o=${uid}">${diagram_map[uid].name}</a>]: 
                        отсутствует ссылка на метод из интерфейса для объекта [<a target="_blank" href="https://ms-seaapp001.bee.vimpelcom.ru:83?m=1&o=${parent_message.server_uid}">${parent_message.server_name ?? 'Unnamed object'}</a>] в сообщении  ${parent_message.message
                            }`)
                    }
                    const parent_context = parent_message.parent();
                    const operation_guid = parent_message.operation_guid ?
                        parent_message.operation_guid === parent_context.operation_guid ? parent_context.operation_guid : parent_message.operation_guid
                        : parent_context.operation_guid;



                    const income_operations = diagram_map[uid].messages.filter(m => m.operation_guid === operation_guid);

                    if (income_operations.length === 1) {
                        if (parent_context.operation_guid === parent_message.operation_guid) {
                            parent_context.messages = income_operations[0].messages;
                            continue;
                        }
                        parent_message.messages = [...income_operations[0].messages, ...parent_message.messages];
                        continue;
                    }
                    throw Error(`Нельзя связать ${JSON.stringify(parent_message.message)}() operation_guid=${operation_guid} с диаграммой ${diagram_map[uid].name}:
                     ${diagram_map[uid].messages.map(m => `[${m.operation_guid}]${m.message}`).join('\r')}`);
                } catch (error) {
                    parent_message.validationError = parent_message.validationError ?? [];
                    parent_message.validationError.push(error.message)
                }
            }
        }

        let root_scenario = diagram_map[processUID];
        return {
            applications: application_map,
            businessInteractions: this.buildBusinessInterations(root_scenario.messages, diagram_map),

        }
    }
    async getE2EProcesses() {
        /**
         * @type {{ group_name, group_uid}}
         */
        const rows = await Repository.queryRows(QUERIES.E2E_PROCESSES_QUERY);
        let tree = rows.reduce((acc, v) => (
            acc[v.group_name] = acc[v.group_name] ?? { name: v.group_name, uid: v.group_uid, base_processes: {} },
            acc[v.group_name].base_processes[v.base_process] = acc[v.group_name].base_processes[v.base_process] ?? { name: v.base_process, uid: v.base_uid, key_processes: {} },
            (acc[v.group_name].base_processes[v.base_process].key_processes[v.key_process] =
                acc[v.group_name].base_processes[v.base_process].key_processes[v.key_process] ?? { name: v.key_process, uid: v.key_uid, scenarios: [] })
                .scenarios.push({ name: v.diagram, uid: v.ea_guid }),
            acc), {})

        return Object.values(tree).map(g => ({
            name: g.name, uid: g.uid,
            base_processes: Object.values(g.base_processes).map(b => ({
                name: b.name, uid: b.uid,
                key_processes: Object.values(b.key_processes)
            }))
        }))
        throw Error('not implemented');
    }
}
export default new E2EProcessService();