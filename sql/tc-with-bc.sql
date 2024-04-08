with recursive bc_catalog as (
	select p.package_id, p.package_id as parent_id, p.name, o.alias
		from t_package p
		join t_object o on o.ea_guid= p.ea_guid
	where p.ea_guid='{CC4EAE49-4A1B-4ef5-9C76-83D629ECF603}'
	union distinct
	select c.package_id, p.parent_id, c.name, coalesce( o.alias, p.alias)
		from bc_catalog p
		join t_package c on c.parent_id=p.package_id
		join t_object o on c.ea_guid=o.ea_guid
), btc as 
(
	select distinct bc.alias as bc_code, c.alias, c.stereotype, c.ea_guid, c.author, c.status, c.name, c.modifieddate
	from bc_catalog cat
		join t_diagram d on d.package_id=cat.package_id
		join t_diagramobjects oo on oo.diagram_id=d.diagram_id
		join t_object c on c.object_id=oo.object_id and c.stereotype ='ArchiMate_TechnicalCapability'
		left join t_connector r on r.end_object_id=c.object_id
		left join t_object bc on bc.object_id= r.start_object_id and bc.stereotype='ArchiMate_Capability' and bc.alias is not null
)
select * from btc
