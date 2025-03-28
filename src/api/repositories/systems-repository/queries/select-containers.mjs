export const SELECT_SYSTEM_CONTAINER_BY_CODE = `WITH cte_realization AS ( select 
    DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation')
SELECT 
	app.name as app_name,
	cn.alias as code,
	cn.name as name,
	cn.ea_guid as uid,
	cn.version,
	cn.author,
	cn.status,
	cn.createddate,
	cn.modifieddate,
	cn.object_id as container_id
FROM t_object app
	JOIN cte_realization cn ON cn.start_object_id=app.object_id AND cn.stereotype='C4_Container'
WHERE  app.stereotype='softwareSystem'
	AND LOWER(app.alias)=LOWER($1) AND LOWER( cn.alias)=LOWER($2)`;