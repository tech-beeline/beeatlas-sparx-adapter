import app_catalog from './application-catalog.mjs'
const TC_PACKAGE_NAME = 'TC';
const ALL_TECH_CAPABILITITES_QUERY = `with recursive app_catalog as (
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
	select  cat.alias as "targetCode" ,c.alias, c.stereotype, c.ea_guid, c.author, c.status, c.name, c.modifieddate, c.alias as code
	from app_catalog cat
	join t_object c on c.package_id=cat.package_id and c.stereotype='ArchiMate_TechnicalCapability' and c.alias is not null
)
select * 
from tc`;

const TECH_CAPABILITITY_QUERY = `${ALL_TECH_CAPABILITITES_QUERY} where tc.code=$1`

const TECH_CAPABILITITY_REALIZATION_QUERY = `with recursive app_catalog as (
    select package_id, package_id as parent_id, name , name::text as "fullName", ea_guid
        from t_package where ea_guid='${app_catalog.APP_CATALOG_ROOT}'
    union distinct
    select c.package_id, p.parent_id, c.name, p."fullName"::text || '/' || c.name, c.ea_guid
        from app_catalog p
        join t_package c on c.parent_id=p.package_id
), rel as ( select 
    distinct r.start_object_id, c.*
    from t_connector r 
        join t_object c on c.object_id=r.end_object_id
    where r.connector_type='Realisation'
)
select 
cat.ea_guid as pguid, cat.name as "packageName", cat."fullName" || '/' || app.name as "fullName", app.author, app.modifiedDate as "modifiedDate",   app.status,
app.name as system, app.alias as cmdb, app.version as sys_version, app.note as sys_description, app.ea_guid,
container.name as container, container.alias as container_code, container.version as container_version, container.note as container_description,
i.name as interface, i.alias as interface_code, i.version as interface_version, i.note as interface_description, 
(select api_url.value from t_objectproperties api_url where api_url.object_id=i.object_id and api_url.property='${app_catalog.API_SPECIFICATION_URL_TAG}' limit 1) as api_url,
tc.alias as "capabilityCode"
from app_catalog cat
join t_object app on app.package_id=cat.package_id and object_type='Component' and alias is not null and stereotype is null
join rel container on container.start_object_id=app.object_id and container.object_type='Component' and container.alias is not null and container.stereotype=''${app_catalog.CONTAINER_STEREOTYPE}''
join rel i on i.start_object_id=container.object_id and i.object_type='Interface' and i.alias is not null and i.alias <> ''
join rel tc on tc.start_object_id=i.object_id and tc.stereotype='ArchiMate_TechnicalCapability'
where tc.alias = $1`;

const TC_PACKAGE_QUERY = `select * from t_package where name='TC' and parent_id=$1`
export default {
	ALL_TECH_CAPABILITITES_QUERY, TECH_CAPABILITITY_QUERY, TECH_CAPABILITITY_REALIZATION_QUERY,
	TC_PACKAGE_QUERY, TC_PACKAGE_NAME
};