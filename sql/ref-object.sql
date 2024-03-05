select ref.object_id, ref.pdata1
from t_object mep 
	join t_object ref on ref.object_id=mep.parentid
where mep.object_type='MessageEndpoint'