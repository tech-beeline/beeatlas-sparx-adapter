
const APP_CATALOG_ROOT = process.env.APP_CATALOG_ROOT ?? '{7889FE97-8783-4311-B229-3A88F8EFA8E3}';
export const APP_PACKAGE = process.env.APP_PACKAGE ?? '{043ED25B-5EB6-4b6b-9A30-14C9CF0AD8A2}';
const CONTAINER_STEREOTYPE = 'C2';
export const API_SPECIFICATION_URL_TAG = 'api_url';
export const PROTOCOL_TAG = 'protocol';

const APPLICATION_CATALOG_CTE = `app_catalog as (
	select package_id, package_id as parent_id, name 
		from t_package where ea_guid='${APP_CATALOG_ROOT}'
	union distinct
	select c.package_id, p.parent_id, c.name
		from app_catalog p
		join t_package c on c.parent_id=p.package_id
),  app as (
	select app.alias, app.object_type, app.name, coalesce(i_provided.object_id, app.object_id) as interface_id, app.object_id as component_id,
	app.alias as cmdb, app.package_id
		from app_catalog
		join t_object app on app.package_id=app_catalog.package_id and app.object_type='Component' and app.alias is not null
		left join t_object i_provided on i_provided.parentid=app.object_id 
)`;

const APPLICATION_QUERY = `with recursive 
${APPLICATION_CATALOG_CTE}
select * from app where app.cmdb is not null`

const APPLICATION_INFO_QUERY = `
with recursive 
${APPLICATION_CATALOG_CTE}
select * from app where app.cmdb = $1
`

const APP_PACKAGE_QUERY = `with recursive app_catalog as (
	select p.package_id, p.package_id as parent_id, p.name, o.alias
		from t_package p
		join t_object o on o.ea_guid= p.ea_guid
	where p.ea_guid='${APP_PACKAGE}'
	union distinct
	select c.package_id, p.parent_id, c.name,  o.alias
		from app_catalog p
		join t_package c on c.parent_id=p.package_id
		join t_object o on c.ea_guid=o.ea_guid
)
select * from app_catalog cat
where cat.alias=$1
`

export default { APP_CATALOG_ROOT, CONTAINER_STEREOTYPE, APPLICATION_CATALOG_CTE, APPLICATION_QUERY, APPLICATION_INFO_QUERY, APP_PACKAGE_QUERY }