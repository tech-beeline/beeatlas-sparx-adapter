with recursive app_catalog as (
	select package_id, package_id as parent_id, name 
		from t_package where ea_guid='{7889FE97-8783-4311-B229-3A88F8EFA8E3}'
	union distinct
	select c.package_id, p.parent_id, c.name
		from app_catalog p
		join t_package c on c.parent_id=p.package_id
)
select * from app_catalog cat
	join t_object app on app.package_id=cat.package_id and object_type='Component'