with recursive e2e_catalog as (select grp.name as group_name, grp.ea_guid as group_uid, base.name as base_process, base.ea_guid as base_uid,
	key_process.name as key_process, key_process.ea_guid as key_uid, key_process.package_id
	from t_package grp 
	join t_package base on base.parent_id=grp.package_id
	join t_package key_process on key_process.parent_id=base.package_id
where grp.parent_id = (select package_id from t_package where ea_guid='{F486A191-8D01-471b-AD9B-271B6AD388EB}')),
e2e_pkg as  (
	select group_name, group_uid, base_process, base_uid, key_process, key_uid, key_process as pkg_name, package_id
	from e2e_catalog
	union
	select group_name, group_uid, base_process, base_uid, key_process, key_uid, p.name, p.package_id
	from e2e_pkg
		join t_package p on p.parent_id=e2e_pkg.package_id
)
select e2e_pkg.*, sd.name as diagram, sd.ea_guid from e2e_pkg
	join t_diagram sd on sd.package_id=e2e_pkg.package_id and sd.stereotype='e2e_diagram'
