const E2E_FILLING_STATUS_QUERY = `
with recursive d_refs as
(
	select od.diagram_id,o.object_id, d.diagram_id as child_diagram_id
	from t_xref x
		join t_object o on o.ea_guid=x.client
		join t_diagram d on d.ea_guid=x.supplier
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
	select app.alias, app.object_type, app.name, coalesce(i_provided.object_id, app.object_id) as interface_id, app.object_id as component_id
		from app_catalog
		join t_object app on app.package_id=app_catalog.package_id and app.object_type='Component'
		left join t_object i_provided on i_provided.parentid=app.object_id
),  cnt_wrong_spec as (
	select d_tree.diagram_id, count(*) as total, count(op_uid.value) as has_op, count(ia_tag.value) as has_ia
	from d_tree
	join t_connector msg on  msg.diagramid=d_tree.child_diagram_id and msg.pdata4='0'
	join app srv on srv.interface_id=msg.end_object_id
	left join t_connectortag op_uid on op_uid.elementid=msg.connector_id and op_uid.property='operation_guid' 
	left join t_connectortag ia_tag on ia_tag.elementid=msg.connector_id and ia_tag.property='InterfaceAgreement'
	group by d_tree.diagram_id
), note_off as (
	select d_tree.diagram_id, count( position( 'ShowSN=1' in coalesce(d.pdata, '') ) = 0) as cnt
	from d_tree
	join t_diagram d on d_tree.child_diagram_id = d.diagram_id
	group by d_tree.diagram_id
), app_stat as (
	select
		d_tree.diagram_id, count(*) as total, count(app.name) as app_cnt
		from d_tree
		join t_diagramobjects od on od.diagram_id= d_tree.child_diagram_id
		join t_object p on p.object_id=od.object_id and object_type not in ('Actor', 'MessageEndpoint' , 'InteractionOccurrence' ,'InteractionFragment' )
		left join app on app.interface_id=p.object_id
	group by d_tree.diagram_id
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
`

export default { E2E_FILLING_STATUS_QUERY }