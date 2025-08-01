import applicationCatalog from "./application-catalog.mjs"

const DIAGRAM_TREE_CTE = `
d_refs as
(
	select od.diagram_id,o.object_id, d.diagram_id as child_diagram_id, d.ea_guid as child_diagram_uid
	from t_xref x
		join t_object o on o.ea_guid=x.client
		join t_diagram d on d.ea_guid=x.supplier and d.diagram_type='Sequence'
		join t_diagramobjects od on od.object_id=o.object_id and od.diagram_id <> d.diagram_id
	where x.name='DefaultDiagram'
	union distinct
	select odd.diagram_id,mep.object_id, ref.pdata1::integer, d.ea_guid
	from t_object mep 
		join t_object ref on ref.object_id=mep.parentid
		join t_diagramobjects odd on odd.object_id = ref.object_id and odd.diagram_id <> ref.pdata1::integer
		join t_diagram d on d.diagram_id=ref.pdata1::integer
	where mep.object_type='MessageEndpoint'
),
d_tree as
(
	select diagram_id as e2e_id, diagram_id as diagram_id, ea_guid as e2e_uid, ea_guid as diagram_uid, 0 as object_id
	from t_diagram where diagram_type='Sequence'
	union distinct
	select d.e2e_id, r.child_diagram_id, d.e2e_uid, r.child_diagram_uid, r.object_id
	from d_refs r
		join d_tree d on d.diagram_id=r.diagram_id
)`;

const E2E_MESSAGES_QUERY = `with recursive ${DIAGRAM_TREE_CTE},
${applicationCatalog.APPLICATION_CATALOG_CTE}, msg as ( select distinct connector.connector_id, connector.diagramid as diagram_id, connector.seqno, 
	connector.ea_guid as message_uid,
	cl.name as client, connector.name as message, cl.object_id as client_id,
	connector.end_object_id as server_id, srv.name as server, d_refs.child_diagram_uid, srv.object_type as server_type, srv.ea_guid as server_uid,
	connector.styleex, connector.stereotype
	from t_connector connector
		join t_object srv on srv.object_id=connector.end_object_id
		join t_object cl on cl.object_id=connector.start_object_id
		left join d_refs on d_refs.object_id=srv.object_id
	where connector.pdata4='0'
)
select 
	coalesce( m.name, msg.message ) as message, msg.message_uid,  msg.seqno,msg.client_id, msg.server_id, msg.child_diagram_uid, 
	msg.server_type, msg.server as server_name, msg.server_uid,
	d.name as diagram, d_tree.*,
	m.ea_guid as operation_guid, 
	m.name as method, msg.stereotype,
	rps.value as rps, latency.value as latency, er.value as error_rate
from d_tree
	join msg on msg.diagram_id=d_tree.diagram_id
	join t_diagram d on d.diagram_id=msg.diagram_id
	left join t_connectortag op on op.property='operation_guid' and elementid=msg.connector_id
	left join t_operation m on m.ea_guid=op.value
	left join t_connectortag rps on rps.property='TPSThreshold' and rps.elementid=msg.connector_id
	left join t_connectortag latency on latency.property='LatencyThreshold' and latency.elementid=msg.connector_id
	left join t_connectortag er on er.property='ErrorThreshold' and er.elementid=msg.connector_id
where d_tree.e2e_uid=$1`

const E2E_PROCESSES_QUERY = `
with recursive e2e_catalog as (select grp.name as group_name, grp.ea_guid as group_uid, base.name as base_process, base.ea_guid as base_uid,
	key_process.name as key_process, key_process.ea_guid as key_uid, key_process.package_id
	from t_package grp 
	join t_package base on base.parent_id=grp.package_id
	join t_package key_process on key_process.parent_id=base.package_id
where grp.parent_id = (select package_id from t_package where ea_guid='{F486A191-8D01-471b-AD9B-271B6AD388EB}')),
e2e_pkg as  (
	select group_name, group_uid, base_process, base_uid, key_process, key_uid, key_process as pkg_name, package_id
	from e2e_catalog
	union
	select group_name, group_uid, base_process, base_uid, key_process, key_uid, p.name, p.package_id
	from e2e_pkg
		join t_package p on p.parent_id=e2e_pkg.package_id
)
select e2e_pkg.*, sd.name as diagram, sd.ea_guid from e2e_pkg
	join t_diagram sd on sd.package_id=e2e_pkg.package_id and sd.stereotype='e2e_diagram'`


const E2E_PROCESS_BI_QUERY = `select distinct ref.object_type,ref.name,  odd.diagram_id, ref.pdata1::integer, d.ea_guid, d.name as bi_name, m.seqno, odd.recttop
from t_diagram p
	join t_diagramobjects odd on odd.diagram_id=p.diagram_id 
	join t_object ref on ref.object_id=odd.object_id and ref.object_type='InteractionOccurrence'
	join t_diagram d on d.diagram_id::text=ref.pdata1
	left join t_object mep on mep.parentid=ref.object_id and mep.object_type='MessageEndpoint'
	left join t_connector m on m.end_object_id=mep.object_id and m.diagramid=p.diagram_id`;


export default { E2E_MESSAGES_QUERY, E2E_PROCESSES_QUERY, E2E_PROCESS_BI_QUERY , DIAGRAM_TREE_CTE}