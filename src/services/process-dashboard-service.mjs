import Repository from "../utils/ea-repo.mjs";
import QUERIES from './sql/process-dashboard.mjs'

const PROCESS_STATUS =
	`with  recursive using_hierarchy as ( 
		select 
				diagram_id as user_id, diagram_id as used_id, 0 as deep
			from t_diagram 
		union
		select distinct 
				parent.user_id, oref.pdata1::integer, deep+1
			from using_hierarchy parent
			join t_diagramobjects od on parent.used_id = od.diagram_id
			join t_object oref on oref.object_id=od.object_id and oref.object_type='InteractionOccurrence'
	)
	select 
	/*
		coalesce(srv_owner.name::text || '/' || srv.name::text, srv.name) as "serverName",
		srv.object_type as "serverType",
		coalesce( srv_owner.alias, srv.alias) as "serverCode",
		coalesce(client_owner.name || '/' || client.name, client.name) as "clientName",
		client.object_type as "clientType",
		client.alias as "clientCode",
		msg.name as operation,*/
		proc_seq.name as "baseDiagramName",
		dref.name as "subDiagramName",
		uh.deep as "subDiagramDeep",
		grp.name as "groupName",
		base.name as "baseProcessName",
		key_proc.name as "keyProcessName",
		proc.name as "processFolder"
		from t_package root
		join t_package grp on grp.parent_id=root.package_id
		left join t_package base on base.parent_id=grp.package_id
		left join t_package key_proc on key_proc.parent_id=base.package_id
		left join t_package proc on proc.parent_id=key_proc.package_id
		left join t_diagram proc_seq on proc_seq.package_id=key_proc.package_id or proc_seq.package_id=proc.package_id
		left join using_hierarchy uh on uh.user_id=proc_seq.diagram_id
		left join t_diagram dref on dref.diagram_id = uh.used_id::integer
		/*left join t_connector msg on uh.used_id=msg.diagramid and msg.name <> 'use' and msg.name <> ''
		left join t_object client on client.object_id=msg.start_object_id
		left join t_object client_owner on client_owner.object_id=client.parentid
		left join t_object srv on srv.object_id=msg.end_object_id
		left join t_object srv_owner on srv.parentid=srv_owner.object_id*/
where root.ea_guid ='{F486A191-8D01-471b-AD9B-271B6AD388EB}'`;

const PROCESS_INTERACTION_QUERY = `with recursive process_bi as
(
	select seq.ea_guid as process_uid ,seq.name, bi_ref.name as biname, bi_scenario.ea_guid as bi_guid, bi_scenario.diagram_id as bi_id
	from t_diagram seq
	join t_diagramobjects bi_od on bi_od.diagram_id=seq.diagram_id
	join t_object bi_ref on bi_ref.object_id=bi_od.object_id and object_type='InteractionOccurrence'
	join t_diagram bi_scenario on bi_scenario.diagram_id=bi_ref.pdata1::integer
),
tc_ref as (
	select seq.ea_guid::text as seq_uid, seq.ea_guid::text as parent_uid, null::integer as object_id
		from t_diagram seq
	union distinct
	select x.supplier, seq.parent_uid, o.object_id
	from tc_ref seq
		join t_diagram d on d.ea_guid=seq.seq_uid
		join t_diagramobjects od on od.diagram_id=d.diagram_id
		join t_object o on o.object_id=od.object_id
		join t_xref x on x.client=o.ea_guid and x.name='DefaultDiagram'
),
parties as (
	select api.object_id, api.name as interface, api.object_type,app.name, coalesce(app.alias,api.alias) as cmdb
	from t_object api
		left join t_object app on app.object_id=api.parentid
)
select 
	 msg.name as msg, msg.ea_guid as msg_uid, 
	 coalesce(cl.name,cl.interface) as client, cl.cmdb as client_code, cl.object_id as client_id,
	 srv.interface, srv.name as supplier, srv.cmdb as supplier_code,srv.object_id supplier_id, 
	 process_bi.name as process, process_bi.biname, sc.name as scenario, tc_ref.*
from process_bi
	join tc_ref on tc_ref.parent_uid = bi_guid
	join t_diagram sc on sc.ea_guid=tc_ref.seq_uid and sc.diagram_type='Sequence'
	join t_connector msg on msg.diagramid=sc.diagram_id
	join parties cl on cl.object_id = msg.start_object_id
	join parties srv on srv.object_id = msg.end_object_id
	join t_connectortag msg_tag on msg_tag.elementid=msg.connector_id
where process_uid=$1
order by msg.seqno`;


export class ProcessStatusRow {
	serverName;
	serverType;
	serverCode;
	clientName; clientType; clientCode;
	groupName;
	baseProcessName;
	keyProcessName;
	baseDiagramName;
	subDiagramName;
	operation;
}

class Party {
	name;
	id;
	code;
	interfaces = [];
	constructor(code, name, interfaces) {
		this.code = code;
		this.name = name;
		if (interfaces) {
			this.interfaces = Array.isArray(interfaces) ? interfaces : [interfaces];
		}
	}
}
class Interaction {
	uid;
	message;
	client;
	supplier;
	object_id;
	/**
	 * @type {BusinessInteraction}
	 */
	scenario;
	constructor(uid, message, client, supplier, object_id) {
		this.uid = uid;
		this.message = message;
		this.client = client;
		this.supplier = supplier;
		this.object_id = object_id;
	}
}

class BusinessInteraction {
	name;
	/**
	 * @type {Array<Interaction>} 
	 */
	integrations = [];
	uid;
	parent_uid;


	constructor(uid, name, parent_uid) {
		this.uid = uid;
		this.name = name;
		this.parent_uid = parent_uid;
	}
}

class Application {

}

class E2EFillingStatusRow {
	sequence;
	sequence_uid;
	id;
	total_messages;
	operations_from_interface;
	operation_has_ia;
	diagram_note_off;
	total_apps;
	apps_from_catalog;
}

export class Process {
	businessInteractions
}

class ProcessDashboardService {
	/**
	 * 
	 * @returns {Promise<ProcessStatusRow[]>}
	 */
	async getProcessStatusRows() {
		return Repository.queryRows(PROCESS_STATUS);
	}
	async getProcessInteractions(code) {
		if (!code) throw Object.assign(Error(`Не указан код процесса`), { status: 400 });
		return Repository.queryRows({ text: PROCESS_INTERACTION_QUERY, values: [code] });
	}

	async getProcessScenario(code) {
		if (!code) throw Object.assign(Error(`Не указан код процесса`), { status: 400 });
		const rows = await Repository.queryRows({ text: PROCESS_INTERACTION_QUERY, values: [code] });
		let scenarios = {};
		let sc_map = {};
		let parties = {};
		for (const r of rows) {
			/**
			 * @type {BusinessInteraction}
			 */
			let interaction = scenarios[r.seq_uid] ?? (scenarios[r.seq_uid] = new BusinessInteraction(r.seq_uid, r.scenario, r.parent_uid));
			if (r.object_id && !sc_map[r.object_id]) sc_map[r.object_id] = interaction;
			let client = parties[r.client_code ?? r.client] ?? (parties[r.client_code ?? r.client] = new Party(r.client_code ?? r.client, r.client));
			const supplier_code = r.supplier_code ?? r.supplier ?? r.supplier_id
			/**
			 * @type {Party}
			 */
			let supplier = parties[supplier_code] ?? (parties[supplier_code] = new Party(supplier_code, r.supplier || r.interface, r.interface))
			if (r.interface && !supplier.interfaces.includes(r.interface)) supplier.interfaces.push(r.interface);

			interaction.integrations.push(new Interaction(r.msg_uid, r.msg, client, supplier, r.supplier_id));
		}

		Object.values(scenarios).forEach(sc => {
			sc.integrations.forEach(i => {
				if (i.object_id && sc_map[i.object_id] && sc_map[i.object_id].uid !== sc.uid) {
					i.scenario = sc_map[i.object_id];
				}
			})
		});

		/**
		 * @type {Array<BusinessInteraction>}
		 */
		const business_interactions = Object.values(scenarios).filter(sc => sc.uid === sc.parent_uid);
		/**
		 * 
		 * @param {Interaction} i 
		 */
		let format_chain = (i) => {
			if (!i.scenario) return [[i]];
			return i.scenario.integrations.reduce((r, ii) => [...r, ...(format_chain(ii).map(j =>
				[i, ...j]))], [])
		}
		let ret = business_interactions.map(bi => ({
			businessIneraction: bi.name, integrations: bi.integrations.reduce((ret, v) => [...ret, ...format_chain(v).map(chain =>
				chain.map(i => `${i.message}->${i.supplier?.name}`))], [])
		}));
		return ret;// Object.values(scenarios).filter(sc => sc.uid === sc.parent_uid);
	}
	async getE2EFillingStatus() {
		/**
		 * @type {Array<E2EFillingStatusRow>}
		 */
		let rows = await Repository.queryRows(QUERIES.E2E_FILLING_STATUS_QUERY);

		return rows.map(r => new Object({
			sequence: r.sequence,
			uid: r.sequence_uid,
			total_interaction: r.total_messages,
			operations_without_ia: r.total_messages - r.operation_has_ia,
			operations_not_specified: r.total_messages - r.operations_from_interface,
			diagrams_notes_off: r.diagram_note_off,
			total_components: r.total_apps,
			components_not_from_catalog: r.total_apps - r.apps_from_catalog
		}))
	}
	async getE2EFillingDetails(code) {
		/**
		 * @type {Array<E2EFillingStatusRow>}
		 */
		if (!code) throw Object.assign(Error(`Не указан код процесса`), { status: 400 });

		let rows = await Repository.queryRows({ text: QUERIES.E2E_FILLING_DETAILS, values: [code] });
		return rows.map(r => new Object({
			sequence: r.sequence,
			uid: r.sequence_uid,
			total_interaction: r.total_messages,
			operations_without_ia: r.total_messages - r.operation_has_ia,
			operations_not_specified: r.total_messages - r.operations_from_interface,
			diagrams_notes_off: r.diagram_note_off,
			total_components: r.total_apps,
			components_not_from_catalog: r.total_apps - r.apps_from_catalog
		}));
	}
	async getDiagramInfo(guid) {
		return Repository.queryRows({ text: 'select name, notes as description, ea_guid from t_diagram where ea_guid=$1', values: [guid] }).then( rows=>rows.find( row=>row) );
	}
	async getDiagramComponentStatus(guid) {
		return Repository.queryRows({ text: QUERIES.E2E_DIAGRAM_COMPONENT_STATUS, values: [guid] });
	}
	async getDiagramMessagesStatus(guid) {
		return Repository.queryRows({ text: QUERIES.E2E_DIAGRAM_MESSAGES, values: [guid] });
	}
}

export default new ProcessDashboardService();