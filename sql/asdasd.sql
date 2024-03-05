select 
	i.name, i.object_id, 
	i.parentid, i.object_type, i.classifier, cls.name, cls.alias,
	parent.name, parent.alias
from t_object i
 left join t_object cls on cls.object_id=i.classifier
 left join t_object parent on parent.object_id=i.parentid
where i.ea_guid in ('{C65995BF-E028-4099-A83C-2C1CC453039F}','{83E11E8A-5D80-456e-8E19-725185207BAE}','{BCD28CCA-1C79-4c5a-8B18-5E73BD4D4E12}')