with recursive 
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
	select diagram_id as e2e_id, diagram_id as diagram_id, ea_guid as e2e_uid, ea_guid as diagram_uid, 0 as object_id, stereotype
	from t_diagram where diagram_type='Sequence'
	union distinct
	select d.e2e_id, r.child_diagram_id, d.e2e_uid, r.child_diagram_uid, r.object_id, d.stereotype
	from d_refs r
		join d_tree d on d.diagram_id=r.diagram_id
),
app_catalog as (
	select package_id, package_id as parent_id, name 
		from t_package where ea_guid='{7889FE97-8783-4311-B229-3A88F8EFA8E3}'
	union distinct
	select c.package_id, p.parent_id, c.name
		from app_catalog p
		join t_package c on c.parent_id=p.package_id
),  app as (
	select app.alias, app.object_type, app.name, coalesce(i_provided.object_id, app.object_id) as interface_id, app.object_id as component_id,
	app.alias as cmdb, app.package_id
		from app_catalog
		join t_object app on app.package_id=app_catalog.package_id and app.object_type='Component' and app.alias is not null
		left join t_object i_provided on i_provided.parentid=app.object_id 
), msg as ( select distinct connector.connector_id, connector.diagramid as diagram_id, connector.seqno, 
	connector.ea_guid as message_uid,
	cl.name as client, connector.name as message, cl.object_id as client_id,
	connector.end_object_id as server_id, srv.name as server, d_refs.child_diagram_uid, srv.object_type as server_type, srv.ea_guid as server_uid,
	connector.styleex, connector.stereotype
	from t_connector connector
		join t_object srv on srv.object_id=connector.end_object_id
		join t_object cl on cl.object_id=connector.start_object_id
		left join d_refs on d_refs.object_id=srv.object_id
	where connector.pdata4='0'
), stat as (select 
	distinct app.cmdb, app.name, d_tree.e2e_uid
from d_tree
	join msg on msg.diagram_id=d_tree.diagram_id
	join t_diagram d on d.diagram_id=msg.diagram_id
	join app on app.interface_id = msg.server_id
			where d_tree.stereotype='e2e_diagram'
)
select  cmdb,name,count(*) from stat
group by cmdb, name
order by count(*) desc