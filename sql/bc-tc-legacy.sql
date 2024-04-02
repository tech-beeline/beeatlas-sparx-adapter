		 
with recursive rt ("package_id","ea_guid","parent_id", "name") as 
(select package_id, ea_guid, parent_id, name from t_package t_0 where name = 'Каталог Возможностей (Capability Catalog)'
 union
 select t_1.package_id, t_1.ea_guid, t_1.parent_id, t_1.name
 from	t_package t_1 inner join rt on (rt.package_id =t_1.parent_id) )
 
 select
	tobj.alias as bc_code,
	tobj2.alias as tc_code,
	tobj2.name,
	tobj2.stereotype,
	tobj2.object_id as id,
	tobj2.author,
	tobj2.modifieddate,
	tobj2.note  as descr,
	tobj2.alias,
	tobj2.status,
	tobj2.ea_guid,
	'' as owner
from 
	t_object tobj, -- capability
	t_diagramobjects tdobj, --cap in diagram
	t_diagram tdg,
	t_connector tcnn,
	t_object tobj2,
	t_diagramobjects tdobj2
	
where 
	tdg.package_id in (select rt .package_id from rt)	-- на диаграмме которая лежит в пакете
	and tobj.object_id = tdobj.object_id
	and tdg.diagram_id = tdobj.diagram_id
	and (tcnn.start_object_id = tobj.object_id or tcnn.end_object_id = tobj.object_id)
	and (tobj2.object_id = tcnn.start_object_id or tobj2.object_id =tcnn.end_object_id) 
	and tobj2.object_id <> tobj.object_id
  	and tobj2.stereotype in ( 'ArchiMate_TechnicalCapability' )
	and tdobj2.object_id = tobj2.object_id
	and tdobj2.diagram_id = tdg.diagram_id
  ;