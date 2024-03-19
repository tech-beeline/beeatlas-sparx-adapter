const COMMON_CTE = `
with recursive d_refs as
(
	select od.diagram_id,o.object_id, d.diagram_id as child_diagram_id
	from t_xref x
		join t_object o on o.ea_guid=x.client
		join t_diagram d on d.ea_guid=x.supplier and d.diagram_type='Sequence'
		join t_diagramobjects od on od.object_id=o.object_id and od.diagram_id <> d.diagram_id
	where x.name='DefaultDiagram'
	union distinct
	select odd.diagram_id,ref.object_id, ref.pdata1::integer
	from t_object mep 
		join t_object ref on ref.object_id=mep.parentid
		join t_diagramobjects odd on odd.object_id = ref.object_id and odd.diagram_id <> ref.pdata1::integer
	where mep.object_type='MessageEndpoint'
), d_tree as
(
	select diagram_id, diagram_id as child_diagram_id
	from t_diagram where diagram_type='Sequence'
	and stereotype='e2e_diagram' --!!!!!
	union distinct
	select d.diagram_id, r.child_diagram_id
	from d_refs r
	join d_tree d on d.child_diagram_id=r.diagram_id
), app_catalog as (
	select package_id, package_id as parent_id, name 
		from t_package where ea_guid='{7889FE97-8783-4311-B229-3A88F8EFA8E3}'
	union distinct
	select c.package_id, p.parent_id, c.name
		from app_catalog p
		join t_package c on c.parent_id=p.package_id
), app as (
	select app.alias, app.object_type, app.name, coalesce(i_provided.object_id, app.object_id) as interface_id, app.object_id as component_id,
	app.alias as cmdb
		from app_catalog
		join t_object app on app.package_id=app_catalog.package_id and app.object_type='Component'
		left join t_object i_provided on i_provided.parentid=app.object_id
), msg as ( select distinct connector.connector_id, connector.diagramid as diagram_id, connector.seqno, cl.name as client, connector.name as message, srv.name as server, op_tag.value as operation_guid, ia_tag.value as ia_path, connector.styleex
	from t_connector connector
		join app srv on srv.interface_id=connector.end_object_id or srv.component_id=connector.end_object_id
		left join t_object cl on cl.object_id=connector.start_object_id
		left join t_connectortag op_tag on op_tag.elementid=connector.connector_id and op_tag.property='operation_guid' 
		left join t_connectortag ia_tag on ia_tag.elementid=connector.connector_id and op_tag.property='InterfaceAgreement' 
	where connector.pdata4='0')
`
const TOTAL_CTE = `${COMMON_CTE}, app_party as (
	select
		distinct d.name as diagram, d_tree.diagram_id as sequence_id, coalesce(app.name,p.name ) as name, 
		app.name as app_name, coalesce( app.component_id, p.object_id) as object_id,
		app.cmdb
		from d_tree
		join t_diagram d on d.diagram_id=d_tree.child_diagram_id
		join t_diagramobjects od on od.diagram_id= d_tree.child_diagram_id
		join t_object p on p.object_id=od.object_id and object_type not in ( 'Note','Actor', 'MessageEndpoint' , 'InteractionOccurrence' ,'InteractionFragment', 'Object', 'Entity')
		left join app on app.interface_id=p.object_id or app.component_id = p.object_id
)
`
const SEQUENCE_CTE = `${COMMON_CTE}, app_party as (
	select
		distinct d.name as diagram, d_tree.child_diagram_id as diagram_id, coalesce(app.name,p.name ) as name, 
		app.name as app_name, coalesce( app.component_id, p.object_id) as object_id,
		app.cmdb
		from d_tree
		join t_diagram d on d.diagram_id=d_tree.child_diagram_id
		join t_diagramobjects od on od.diagram_id= d_tree.child_diagram_id
		join t_object p on p.object_id=od.object_id and object_type not in ( 'Note','Actor', 'MessageEndpoint' , 'InteractionOccurrence' ,'InteractionFragment', 'Object', 'Entity')
		left join app on app.interface_id=p.object_id or app.component_id = p.object_id
)
`
const E2E_FILLING_STATUS_QUERY = `${TOTAL_CTE}, msg_seq as (
	select distinct 
		connector_id, d_tree.diagram_id as diagram_id, seqno, client,  message,server, operation_guid,  ia_path, styleex 
	from msg join d_tree on d_tree.child_diagram_id=msg.diagram_id
),
	cnt_wrong_spec as (
	select msg_seq.diagram_id as diagram_id, count(*) as total, count(msg_seq.operation_guid) as has_op, count(msg_seq.ia_path) as has_ia
	from msg_seq
	group by msg_seq.diagram_id
), note_off as (
	select d_tree.diagram_id, count( case when position( 'ShowSN=1' in coalesce(d.pdata, '') ) = 0 then 1 else null end) as cnt
	from d_tree
	join t_diagram d on d_tree.child_diagram_id = d.diagram_id
	group by d_tree.diagram_id
), app_stat as (
	select app_party.sequence_id as diagram_id, count(*) total, count(app_party.app_name) as app_cnt
	from app_party
	group by app_party.sequence_id
	)
select 
	s.name as sequence, s.ea_guid as sequence_uid, s.diagram_id as id, 
	cnt_wrong_spec.total as total_messages,cnt_wrong_spec.has_op as operations_from_interface,cnt_wrong_spec.has_ia as operation_has_ia, note_off.cnt as diagram_note_off,
	app_stat.total as total_apps, app_stat.app_cnt as apps_from_catalog
from t_diagram s
left join cnt_wrong_spec on s.diagram_id=cnt_wrong_spec.diagram_id
left join note_off on s.diagram_id=note_off.diagram_id
left join app_stat on app_stat.diagram_id=s.diagram_id
where s.stereotype='e2e_diagram'
`;

const E2E_FILLING_DETAILS = `${SEQUENCE_CTE},
cnt_wrong_spec as (
	select msg.diagram_id as diagram_id, count(*) as total, count(msg.operation_guid) as has_op, count(msg.ia_path) as has_ia
	from msg
	group by msg.diagram_id
), note_off as (
	select d.diagram_id, position( 'ShowSN=1' in coalesce(d.pdata, '') ) = 0 as cnt
	from  t_diagram d
), app_stat as (
	select app_party.diagram_id as diagram_id, count(*) total, count(app_party.app_name) as app_cnt
	from app_party
	group by app_party.diagram_id
	)
select 
	s.name as sequence, s.ea_guid as sequence_uid, s.diagram_id as id, 
	cnt_wrong_spec.total as total_messages,cnt_wrong_spec.has_op as operations_from_interface,cnt_wrong_spec.has_ia as operation_has_ia, note_off.cnt as diagram_note_off,
	app_stat.total as total_apps, app_stat.app_cnt as apps_from_catalog
from t_diagram s
join d_tree on d_tree.child_diagram_id=s.diagram_id
left join cnt_wrong_spec on s.diagram_id=cnt_wrong_spec.diagram_id
left join note_off on s.diagram_id=note_off.diagram_id
left join app_stat on app_stat.diagram_id=s.diagram_id
where d_tree.diagram_id in ( select diagram_id from t_diagram where ea_guid=$1)`;
const E2E_DIAGRAM_COMPONENT_STATUS = `${SEQUENCE_CTE}
select app_party.app_name, p.object_type , p.ea_guid, app_party.cmdb, p.name
from app_party 
	join t_object p on p.object_id=app_party.object_id
	 where app_party.diagram_id in ( select diagram_id from t_diagram where ea_guid =$1) `;

const E2E_DIAGRAM_MESSAGES = `${SEQUENCE_CTE}
select distinct msg.diagramid, msg.seqno, cl.name as client, msg.name as message, srv.name as server, op_tag.value as operation_guid, ia_tag.value as ip_path, msg.styleex
	from t_connector msg
		join app srv on srv.interface_id=msg.end_object_id or srv.component_id=msg.end_object_id
		left join t_object cl on cl.object_id=msg.start_object_id
		left join t_connectortag op_tag on op_tag.elementid=msg.connector_id and op_tag.property='operation_guid' 
		left join t_connectortag ia_tag on ia_tag.elementid=msg.connector_id and op_tag.property='InterfaceAgreement' 
	where msg.diagramid in ( select diagram_id from t_diagram where ea_guid =$1)
	and msg.pdata4='0'
order by msg.seqno`

export default { E2E_FILLING_STATUS_QUERY, E2E_FILLING_DETAILS, E2E_DIAGRAM_COMPONENT_STATUS, E2E_DIAGRAM_MESSAGES }