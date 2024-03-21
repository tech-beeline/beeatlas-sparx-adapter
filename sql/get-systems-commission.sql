with recursive app_catalog as (
        select package_id, package_id as parent_id, name , name::text as "fullName", ea_guid
            from t_package where ea_guid='{7889FE97-8783-4311-B229-3A88F8EFA8E3}'
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
    cat.ea_guid as pguid, cat.name as package, cat."fullName" || '/' || app.name as "fullName", app.author, app.modifiedDate as "modifiedDate",  app.status,
    app.name as system, app.alias as cmdb, app.version as sys_version, app.note as sys_description, app.ea_guid,
    container.name as container, container.alias as container_code, container.version as container_version, container.note as container_description,
    i.name as interface, i.alias as interface_code, i.version as interface_version, i.note as interface_description, 
    (select api_url.value from t_objectproperties api_url where api_url.object_id=i.object_id and api_url.property='api_url' limit 1) as api_url,
	(select alias from rel tc where tc.start_object_id=i.object_id and tc.stereotype='ArchiMate_TechnicalCapability' limit 1) as "capabilityCode"
    from app_catalog cat
    join t_object app on app.package_id=cat.package_id and object_type='Component' and alias is not null and stereotype is null
    left join rel container on container.start_object_id=app.object_id and container.object_type='Component' and container.alias is not null and container.stereotype='C2'
        left join rel i on i.start_object_id=container.object_id and i.object_type='Interface' and i.alias is not null and i.alias <> ''
		where app.alias='CMDB_B'