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
	select distinct  c.alias, c.stereotype, c.ea_guid, c.author, c.status, c.name, c.modifieddate, cat.alias as p_code
	from bc_catalog cat
		join t_diagram d on d.package_id=cat.package_id
		join t_diagramobjects oo on oo.diagram_id=d.diagram_id
		join t_object c on c.object_id=oo.object_id and c.stereotype in ('ArchiMate_Capability', 'ArchiMate_TechnicalCapability')
)
select p.name, pp.package_id as package_id, btc.* from btc
join t_object p on p.alias=btc.p_code and p.object_type='Package'
join t_package pp on pp.ea_guid=p.ea_guid