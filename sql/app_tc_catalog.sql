with recursive app_catalog as (
	select p.package_id, p.package_id as parent_id, p.name, o.alias
		from t_package p
		join t_object o on o.ea_guid= p.ea_guid
	where p.ea_guid='{043ED25B-5EB6-4b6b-9A30-14C9CF0AD8A2}'
	union distinct
	select c.package_id, p.parent_id, c.name, coalesce( o.alias, p.alias)
		from app_catalog p
		join t_package c on c.parent_id=p.package_id
		join t_object o on c.ea_guid=o.ea_guid
), tc as (
	select  cat.alias as "targetCode" ,c.alias, c.stereotype, c.ea_guid, c.author, c.status, c.name, c.modifieddate
	from app_catalog cat
	join t_object c on c.package_id=cat.package_id and c.stereotype='ArchiMate_TechnicalCapability' and c.alias is not null
)
select * 
from tc
