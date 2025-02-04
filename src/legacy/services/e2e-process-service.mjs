import Repository, {
    t_connector,
    t_diagram
} from '../../api/repositories/sparx-ea-repository/index.mjs';

import { BusinessInteraction } from '../model/e2e-process.mjs';

import { BadRequest, NotFound, NotImplemented } from '../../utils/errors.mjs';
import IARepository from '../../utils/ia.mjs';
import applicationService from './application-service.mjs';
import CallTreeBuilder, { onError } from './call-tree-builder.mjs';
import QUERIES from './sql/e2e-process-queries.mjs'
import { TC_API_QUERY } from './sql/interfaces-queries.mjs';


class E2EProcessService {
    /**
     * 
     * @param {Array<{ server_type, message, child_diagram_uid}>} messages 
     * @param {} diagram_map
     * @returns {BusinessInteraction[]}
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
                context.messages.push({ type: "internalCall", message: msg.message, diagram: msg.diagram })
                continue;
            }

            if (!parent_context) {
                (context.failedMessages = context.failedMessages ?? []).push(msg);
                console.log(`Не получилось определить контекст для ${JSON.stringify(msg)}`)
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

    #formatValidationError(msg, ia, client, server) {
        const validation_rule = [
            (msg, ia, client, server) => ia.provider?.cmdbMnemonic !== client.code ? `Провайдер в IA не соответствует вызову в сценарии` : undefined
        ];
    }

    /**
     * 
     * @param {*} processUID 
     * @returns {Promise<Array<{ message, e2e_uid, diagram_uid, server_id}>}
     */
    async getProcessMessages(processUID) {
        if (!processUID) throw BadRequest(`не задан идентификатор процесса`);
        /**
         * @type {Array<{ message, e2e_uid, diagram_uid, server_id}>}
         */
        return Repository.queryRows({ text: QUERIES.E2E_MESSAGES_QUERY, values: [processUID] });
    }
    /**
     * 
     * @param {String} processUID 
     * @returns {Promise<{businessInteractions : BusinessInteraction[], application}>}
     */
    async getProcessScenario(processUID, { isBIScenario } = {}) {

        const process = await Repository.first(t_diagram, { ea_guid: processUID });
        if (!process)
            throw NotFound(`Процесс с UID = ${processUID} не найден`)
        let rows = await this.getProcessMessages(processUID)
        const app_catalog = await applicationService.getApplications();


        let diagram_map = {};
        let application_map = {
        };

        for (const row of rows) {
            row.validationError = [];

            const server = app_catalog.byObjectId(row.server_id);

            if (server) {
                if (!application_map[server.cmdb]) application_map[server.cmdb] = server;
                row.server = server.$ref;
                row.server_id = server.component_id;
            }

            const client = app_catalog.byObjectId(row.client_id);
            if (client) {
                if (!application_map[client.cmdb]) application_map[client.cmdb] = client;
                row.client = client.$ref;
                row.client_id = client.component_id
            }

            if (server && !row.operation_guid) {
                row.validationError.push(`Сообщение не связано с методом интерфейса (operation_guid = null)`)
            }

            if (server && row.ia_path) {
                const ia = await IARepository.Instance.byPath(decodeURIComponent(row.ia_path))
                row.interfaceAgreement = ia ? {
                    path: row.ia_path,
                    parseError: ia.parseError ?? undefined,
                    raw: ia.yaml ? undefined : ia.raw,
                    yaml: ia.yaml ?? undefined,
                    validationError: this.#formatValidationError(row, ia, client, server)
                } : {
                    path: row.ia_path,
                    validationError: [`Не удалось найти интерфейсное соглашение по пути ${row.ia_path}`]
                }
            }

            row.ia_path = undefined;

            if (row.styleex) {
                const styleex_map = row.styleex?.split(';').filter(v => v.length).reduce((acc, v) => {
                    const kv = v.split('=');
                    return kv.length > 0 ? Object.assign(acc, { [kv[0]]: kv.slice(1).join('') }) : acc;
                }, {})
                if (styleex_map.DCBM) {
                    row.duration = styleex_map.DCBM;
                }
            }
            row.styleex = undefined;

            (diagram_map[row.diagram_uid] = diagram_map[row.diagram_uid] ?? { name: row.diagram, messages: [] }).messages.push(row);
        }

        for (const uid in diagram_map) {
            if (uid === processUID && !(isBIScenario || process.stereotype !== 'e2e_diagram')) continue;

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

        return isBIScenario || process.stereotype !== 'e2e_diagram' ? {
            processUID: processUID,
            name: root_scenario.name,
            applications: application_map,
            messages: root_scenario?.messages ?? []
        } : {
            processUID: processUID,
            name: root_scenario.name,
            businessInteractions: this.buildBusinessInterations(root_scenario?.messages ?? [], diagram_map),
            applications: application_map
        }
    }

    async getProcessBusinessInterctions(code) {
        let rows = await Repository.queryRows(`${QUERIES.E2E_PROCESS_BI_QUERY} where p.ea_guid=$1 order by m.seqno`, [code]);
        const valid_rows = rows.filter(r => r.seqno);
        const invalid_rows = rows.filter(r => !valid_rows.some(v => v.ea_guid === r.ea_guid)).map(r => Object.assign(r, { alert: `Не связано с сообщением или MessageEndpoint не является дочерним элементом для диаграммы` }))
        return [...valid_rows, ...invalid_rows];
    }

    async getProcessSummary(code) {
        return Repository.first(t_diagram, { ea_guid: code }).then(p => ({ name: p.name, description: p.notes, code: p.ea_guid, author: p.author }))
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
    }
    async #loadBIScenarioData(uid) {

        const [diagram_rows, api_methods, scenario] = await Promise.all(
            [
                Repository.queryRows(`with recursive ${QUERIES.DIAGRAM_TREE_CTE} select * from d_tree where e2e_uid=$1`, [uid]),
                Repository.queryRows(TC_API_QUERY),
                Repository.first(t_diagram, { ea_guid: uid })
            ]); // [ ] Возможно надо добавить фильтрацию при запросе, что бы не тащить все методы

        if (!scenario)
            throw NotFound(`Сценарий с uid=${uid} не найден`);

        const diagram_uids = diagram_rows.map(d => d.diagram_uid);

        const [messages, systems] = await Promise.all([
            Repository.queryRows(
                `select d.ea_guid as d_uid, d.name as diagram, m.name, m.start_object_id as client_id, m.end_object_id as server_id, m.stereotype, m.ea_guid, m.notes,
op.value as operation_guid, rps.value as rps, l.value as latency, e.value as error_rate, m.seqno, m.pdata1 = 'Synchronous' as is_sync, m.pdata4 as is_ret, ia.value as ia_path
from t_diagram d
join t_connector m on m.diagramid=d.diagram_id
left join t_connectortag op on op.elementid=m.connector_id and op.property='operation_guid'
left join t_connectortag rps on rps.elementid=m.connector_id and rps.property='TPSThreshold'
left join t_connectortag l on l.elementid=m.connector_id and l.property='LatencyThreshold'
left join t_connectortag e  on e.elementid=m.connector_id and e.property='ErrorThreshold'
left join t_connectortag ia on ia.elementid=m.connector_id and ia.property='InterfaceAgreement'
where d.ea_guid  = ANY($1)`, [diagram_uids]
            ),
            Repository.queryRows(`SELECT d.ea_guid as d_uid,od.object_id, p.object_id as parent_id, coalesce( p.alias, o.alias) as code, coalesce(p.name, o.name) as name, o.object_type
        FROM t_diagram d
            JOIN t_diagramobjects od on od.diagram_id=d.diagram_id
            JOIN t_object o on o.object_id=od.object_id
            LEFT JOIN t_object p on p.object_id=o.parentid and o.object_type='ProvidedInterface'
            where d.ea_guid=ANY($1)`, [diagram_uids])
        ]);
        return [
            diagram_rows,
            api_methods,
            messages,
            systems,
            scenario
        ]
    }

    async getBIScenario(uid) {
        const EXCLUDE_NAMES = {
            use: true,
            "use()": true
        }

        let [diagram_rows, api_methods, messages, system_rows, scenario] = await this.#loadBIScenarioData(uid);
        const methods = api_methods.reduce((res, m) => m.operation_guid ? ((res[m.operation_guid] = m), res) : res, {});
        const systems = system_rows.reduce((res, s) => Object.assign(res, { [s.object_id]: Object.assign({ interfaces: {} }, s) }), {})

        const diagrams = { byUID: {}, byContainerId: {} };
        for (const d of diagram_rows) {
            diagrams.byContainerId[d.object_id] = diagrams.byUID[d.diagram_uid] = diagrams.byUID[d.diagram_uid] ?? (diagrams.byUID[d.diagram_uid] = Object.assign(d, { messages: [], parents: [] }));
        }

        const usedSystems = {}

        const useSystem = id => usedSystems[id] ?? (usedSystems[id] = systems[id]);

        for (const m of messages) {
            if ((m.server = useSystem(m.server_id)) && m.operation_guid) {
                const method = methods[m.operation_guid];
                if (!method) {
                    const error_message = `Не найден метод с guid=${m.operation_guid}. Сообщение ${m.name}, Диаграмма ${m.diagram}`;
                    onError(m, error_message)
                } else {
                    const api = m.server.interfaces[method.api_guid] ?? (m.server.interfaces[method.api_guid] =
                    {
                        name: method.api,
                        code: method.api_code,
                        uid: method.api_guid,
                        protocol: method.protocol,
                        methods: {}
                    });
                    api.methods[method.name] = method;
                    m.method = method;
                }
            }

            m.client = useSystem(m.client_id);
            if (m.ia_path) {
                if (m.ia_path.endsWith('?ref_type=heads')) m.ia_path = m.ia_path.slice(0, -15)
                m.ia = {
                    path: m.ia_path,
                    content: await IARepository.Instance.byPath(decodeURIComponent(m.ia_path))
                }
            }
            //m.method = methods[m.operation_guid];

            if (m.client && m.server) {
                m.childDiagram = diagrams.byContainerId[m.server_id];
                m.childDiagram?.parents.push(m);

            }
            if (m.server?.object_type === 'MessageEndpoint') {
                const error_message = `Сообщение связано с Message Endpoint ${m.server.name}`
                onError(m, error_message)
            }

            if (!m.server || !m.client) {
                onError(m, `Сообщение связано с элементом, который отсутствует на диаграмме`)
            }
        }

        messages = messages.filter(
            m => m.is_sync
                && !EXCLUDE_NAMES[m.name]
                && m.client_id && m.server_id
                && m.is_ret !== '1'
        ).sort((a, b) => (a.d_uid > b.d_uid) ? 1 : ((b.d_uid > a.d_uid) ? -1 : 0) || a.seqno - b.seqno);

        CallTreeBuilder.setParents(messages);
        for (const m of messages.filter(m => !m.parent)) {
            diagrams.byUID[m.d_uid].messages.push(m);
        }

        const root_messages = []
        for (const m of diagrams.byContainerId[0]?.messages) {
            root_messages.push(...CallTreeBuilder.build(m));
        }

        //messages.forEach(m => m.childDiagram = undefined);

        let applications = {}
        for (const o of Object.values(usedSystems)) {
            if (!o) continue;
            const code = o.code ?? o.object_id
            const app = applications[code] ?? (applications[code] = { code: code, name: o.name, interfaces: {}, type: o.object_type });
            Object.assign(app.interfaces, o.interfaces)
        }

        return {
            info: { name: scenario.name, authod: scenario.author, version: scenario.version, createdDate: scenario.createddate, modifiedDate: scenario.modifieddate, guid: scenario.ea_guid },
            callTrace: root_messages,
            applications: applications
        }
    }

    async getProcessSystems() {
        let processes = await this.getE2EProcesses();
        console.log(processes)
        NotImplemented();
    }
    async getMessageDetails(uid) {
        const [message, server_methods] = await Promise.all([
            Repository.first(t_connector, { ea_guid: uid }),
            Repository.queryRows(`with recursive cls as(
                select object_id, classifier
                from t_object where classifier <>0 
                union distinct 
                select distinct start_object_id, end_object_id
                from t_connector where connector_type in ('Realisation', 'Generalization')
            ), cte_cls as (
                select object_id, object_id as cls_id
                from t_object where object_id = (select end_object_id from t_connector where ea_guid=$1 )
                union distinct 
                    select c.object_id, cls.classifier 
                from cte_cls c	join cls on cls.object_id= c.cls_id
            )
            select op.name, op.ea_guid as operation_guid
            from cte_cls 
            join t_operation op on op.object_id=cte_cls.cls_id`, [uid])
        ]);
        return { message: message, server_methods: server_methods }
    }
}
export default new E2EProcessService();