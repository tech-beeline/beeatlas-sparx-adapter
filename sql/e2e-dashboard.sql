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
)
select s.diagram_id, s.name as sequence, -- d.name, 
	count( position( 'ShowSN=1' in coalesce(d.pdata, '') ) = 0) as note_off
from d_tree
 join t_diagram d on d_tree.child_diagram_id = d.diagram_id
 join t_diagram s on s.diagram_id=d_tree.diagram_id
 where s.stereotype = 'e2e_diagram'
 group by s.diagram_id, s.name
 
