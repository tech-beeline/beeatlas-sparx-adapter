import app_catalog from './application-catalog.mjs'

const ALL_TECH_CAPABILITITES_QUERY = `with recursive rt ("package_id","ea_guid","parent_id", "name") as 
(select package_id, ea_guid, parent_id, name from t_package t_0 where ea_guid = '{CC4EAE49-4A1B-4ef5-9C76-83D629ECF603}'
 union
 select t_1.package_id, t_1.ea_guid, t_1.parent_id, t_1.name
 from	t_package t_1 inner join rt on (rt.package_id =t_1.parent_id) )
 
 select
 	tobj.alias as bc_code,
	tobj.stereotype as parent_stereotype,
	tobj2.alias as code,
	tobj2.name,
	tobj2.object_id as id,
	tobj2.author,
	tobj2.modifieddate,
	tobj2.note  as description,
	tobj2.status,
	tobj2.ea_guid,
	'' as owner
from 
	t_object tobj, -- capability
	t_diagramobjects tdobj, --cap in diagram
	t_diagram tdg,
	t_connector tcnn,
	t_object tobj2,
	t_diagramobjects tdobj2
where 
	tdg.package_id in (select rt .package_id from rt)	-- на диаграмме которая лежит в пакете
	and tobj.object_id = tdobj.object_id
	and tdg.diagram_id = tdobj.diagram_id
	and (tcnn.start_object_id = tobj.object_id or tcnn.end_object_id = tobj.object_id)
	and (tobj2.object_id = tcnn.start_object_id or tobj2.object_id =tcnn.end_object_id) 
	and tobj2.object_id <> tobj.object_id
  	and tobj2.stereotype in ( 'ArchiMate_TechnicalCapability' )
	and tdobj2.object_id = tobj2.object_id
	and tdobj2.diagram_id = tdg.diagram_id
	and tobj.stereotype in ('ArchiMate_Capability', 'ArchiMate_TechnicalCapability')
`
const TECH_CAPABILITITY_QUERY = `${ALL_TECH_CAPABILITITES_QUERY} and tobj2.alias=$1`

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
where tc.alias = $1`

export default { ALL_TECH_CAPABILITITES_QUERY , TECH_CAPABILITITY_QUERY, TECH_CAPABILITITY_REALIZATION_QUERY};