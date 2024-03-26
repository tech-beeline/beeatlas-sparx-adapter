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

    buildMessageTree(messages) {
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
            if (msg.client_id === msg.server_id && !msg.operation_guid) {
                context.messages.push({ type: "internalCall", message: msg.message })
                continue;
            }
            let parent_context = searchContext(context, msg.client_id);
            if (!parent_context) {
                (context.failedMessages = context.failedMessages ?? []).push(msg);
                continue;
            }

            if (parent_context.server_id === msg.client_id) {
                let new_context = { ...msg, messages: [], parent: () => parent_context }
                parent_context.messages.push(new_context);
                if (msg.client_id !== msg.server_id)
                    context = new_context;
                continue;
            }
            throw Error('not implemented');

        }
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
            const server = app_catalog.byObjectId(row.server_id);
            if( server ){
                if( !application_map[server.cmdb]) application_map[server.cmdb] = server;
                row.server = { "$ref": `#/applications/${server.cmdb}`}
            }

            (diagram_map[row.diagram_uid] = diagram_map[row.diagram_uid] ?? { name: row.diagram, messages: [] }).messages.push(row);
        }

        for (const uid in diagram_map) {
            if (uid === processUID) continue;

            diagram_map[uid].messages = this.buildMessageTree(diagram_map[uid].messages)
        }

        let root_scenario = diagram_map[processUID];
        return {
            applications: application_map,
            businessInteractions: this.buildBusinessInterations(root_scenario.messages, diagram_map),
            
        }
    }
}
export default new E2EProcessService();