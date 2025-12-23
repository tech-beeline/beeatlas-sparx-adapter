export const SELECT_SCENARIO_INTERFACES=`WITH cte_realization AS (
	SELECT l.end_object_id as from_id, o.* 
	FROM t_connector l 
		JOIN t_object o on o.object_id=l.start_object_id
	WHERE l.connector_type='Realisation'
), cte_api_tags AS (
	SELECT p.object_id, p.value AS  protocol
	FROM t_objectproperties p WHERE p.property='protocol'
), cte_op as (
	SELECT 
		o.object_id as api_id,
		o.name,
		o.operationid, 
		o.ea_guid as uid,
		rps.value AS rps,
		l.value AS latency,
		e.value AS error_rate
	FROM t_operation o
		LEFT JOIN t_operationtag rps ON rps.elementid=o.operationid AND rps.property='rps'
		LEFT JOIN t_operationtag l ON l.elementid=o.operationid AND l.property='latency'
		LEFT JOIN t_operationtag e ON e.elementid=o.operationid AND e.property='error_rate'
), cte_app AS (
	SELECT
		name, 
		alias AS code, 
		object_id AS app_id
	FROM t_object where stereotype='softwareSystem'
), cte_api AS (
	SELECT
		1 as manual,
		app.name app_name, app.code AS app_code, app.app_id,
		pr_api.name as container, pr_api.alias as container_code, pr_api.object_id as container_id,
		api.name as api_name, COALESCE( api.alias, api.name) as api_code, api.object_id as api_id, api.ea_guid as api_uid
	FROM t_object pr_api
		JOIN cte_app app ON app.app_id=pr_api.parentid
		JOIN t_object api ON api.object_id=pr_api.classifier
	WHERE pr_api.object_type='ProvidedInterface'
	UNION
	SELECT
		0 as manual,
		app.name AS app_name, app.alias AS app_code, app.object_id AS app_id,
		container.name AS container, container.alias AS container_code, container.object_id as container_id,
		api.name AS api_name, api.alias AS api_code, api.object_id AS api_id, api.ea_guid as api_uid
	FROM cte_realization app
		JOIN cte_realization container ON container.object_id=app.from_id AND  container.stereotype='C4_Container'
		JOIN t_object api ON api.object_id=container.from_id AND api.object_type='Interface'
)
SELECT 
	api.*
FROM cte_api api
	WHERE api.app_id = ANY($1) OR api.container_id=ANY($1) OR api.api_id=ANY($1)
`