
const APP_CATALOG_ROOT = process.env.APP_CATALOG_ROOT ?? '{7889FE97-8783-4311-B229-3A88F8EFA8E3}';
const CONTAINER_STEREOTYPE = 'C2';
const API_SPECIFICATION_URL_TAG = 'api_url'

const APPLICATION_CATALOG_CTE = `app_catalog as (
	select package_id, package_id as parent_id, name 
		from t_package where ea_guid='${APP_CATALOG_ROOT}'
	union distinct
	select c.package_id, p.parent_id, c.name
		from app_catalog p
		join t_package c on c.parent_id=p.package_id
), app as (
	select app.alias, app.object_type, app.name, coalesce(i_provided.object_id, app.object_id) as interface_id, app.object_id as component_id,
	app.alias as cmdb
		from app_catalog
		join t_object app on app.package_id=app_catalog.package_id and app.object_type='Component'
		left join t_object i_provided on i_provided.parentid=app.object_id
)`;

const APPLICATION_QUERY = `with recursive 
${APPLICATION_CATALOG_CTE}
select * from app where app.cmdb is not null
`

export default { APP_CATALOG_ROOT , CONTAINER_STEREOTYPE, API_SPECIFICATION_URL_TAG, APPLICATION_CATALOG_CTE, APPLICATION_QUERY}