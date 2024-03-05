select o.object_id, d.diagram_id
from t_xref x
	join t_object o on o.ea_guid=x.client
	join t_diagram d on d.ea_guid=x.supplier
where x.name='DefaultDiagram'
union distinct
select ref.object_id, ref.pdata1::integer
from t_object mep 
	join t_object ref on ref.object_id=mep.parentid
where mep.object_type='MessageEndpoint'