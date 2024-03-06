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
	from t_diagram where diagram_type='Sequence'--ea_guid='{AD0F73D8-87B1-41ed-AD5A-61DC188466D7}'
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
)
select 
		cl.object_type as client_type, msg.name, 
		client.name, client.alias as client_code, 
		srv.name as server, srv.alias as server_code, s.object_type as server_type
	from d_tree
	join t_connector msg on msg.diagramid=d_tree.child_diagram_id and msg.pdata4='0'
	join t_object cl on cl.object_id=msg.start_object_id 
	join t_object s on s.object_id=msg.end_object_id
	left join app client on client.interface_id=msg.start_object_id
	left join app srv on srv.interface_id=msg.end_object_id
	where d_tree.diagram_id=13770 and client.alias<>srv.alias