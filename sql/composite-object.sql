select cd.object_id, d.diagram_id 
from t_object cd
	join t_object comp on comp.object_id=cd.classifier
	join t_xref x on x.client=cd.ea_guid and x.name='DefaultDiagram'
	join t_diagram d on d.ea_guid=x.supplier