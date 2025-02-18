export const SELECT_METHOD_ALL_SOURCES = `
WITH RECURSIVE cte_src AS (
	SELECT
		t.object_id as target_id,
		src.object_id as source_id
	FROM t_object t 
		JOIN t_connector c ON c.end_object_id=t.object_id AND c.connector_type='Realisation'
		JOIN t_object src ON src.object_id=c.start_object_id AND src.stereotype='grafana-source'
), cte_app_pkg AS (
	SELECT 
		p.package_id, p.name, p.name::text as "FQName"
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='ApplicationCatalogue'
	UNION
	SELECT 
		p.package_id, p.name, parent."FQName" || '/' || p.name
	FROM cte_app_pkg parent
		JOIN t_package p ON p.parent_id=parent.package_Id
		JOIN t_object o ON o.ea_guid=p.ea_guid
), cte_app AS (
	SELECT 
		app.object_id,
		app.name, 
		app.stereotype,
		app.alias as code, 
		app.ea_guid as uid,
		pkg."FQName" || '/' || app.name as FQName,
		src.source_id
	FROM cte_app_pkg pkg
		JOIN t_object app ON app.package_id=pkg.package_id
			AND app.object_type='Component'
		LEFT JOIN cte_src src ON src.target_id=app.object_id
	WHERE app.stereotype='softwareSystem'
), cte_provided AS (
	SELECT 
		api.name,
		api.alias as code,
		api.ea_guid,
		api.object_id,
		coalesce(src.source_id,app.source_id) as source_id,
		app.code as app_code
	FROM cte_app app
		JOIN t_object pi ON pi.parentid=app.object_id
		JOIN t_object api ON api.object_id=pi.classifier
		LEFT JOIN cte_src src ON src.target_id=api.object_id
), cte_rls AS (
	SELECT
		app.name,
		app.code,
		app.uid,
		app.object_id,
		app.name::text as FQName,
		'NULL'::text as type,
		app.code as app_code,
		app.source_id
	FROM cte_app app
	UNION DISTINCT
	SELECT
		ch.name,
		ch.alias,
		ch.ea_guid,
		ch.object_id,
		r.name || '/' ||  ch.name,
		c.connector_type,
		r.app_code,
		coalesce( src.source_id, r.source_id)
	FROM cte_rls r
		LEFT JOIN t_connector c ON c.start_object_id=r.object_id
			AND c.connector_type='Realisation'
		LEFT JOIN t_object ch ON ch.object_id=c.end_object_id
			AND (ch.object_type = 'Interface' OR ch.stereotype='C4_Container')
			AND ch.status <> 'REMOVED'
		LEFT JOIN cte_src src ON src.target_id=ch.object_id
), cte_api AS (
	SELECT
		api.name,
		api.code,
		api.ea_guid as api_guid,
		api.object_id,
		api.app_code,
		api.source_id
	FROM cte_provided api
	UNION
	SELECT
		api.name,
		api.code,
		api.uid,
		api.object_id,
		api.app_code,
		api.source_id
	FROM cte_rls api
)
SELECT DISTINCT
	i.name, i.code, i.api_guid, m.name as method, m.ea_guid as operation_guid, i.source_id,
	latency.value as latency, rps.value as rps, error_rate.value as error_rate
FROM cte_api i
	JOIN t_operation m ON m.object_id=i.object_id
	LEFT JOIN t_operationtag latency ON latency.elementid=m.operationid AND latency.property='latency'
	LEFT JOIN t_operationtag rps ON rps.elementid=m.operationid AND rps.property='rps'
	LEFT JOIN t_operationtag error_rate ON error_rate.elementid=m.operationid AND error_rate.property='error_rate'`;

export const SELECT_METHOD_SOURCES = `${SELECT_METHOD_ALL_SOURCES} WHERE i.source_id IS NOT NULL`

export const SELECT_SOURCES_PROPERIES = `SELECT 
	gs.name,
	gs.ea_guid AS uid,
	gs.object_id as source_id,
	t.property,
	t.value
FROM t_object gs
	JOIN t_objectproperties t ON t.object_id=gs.object_id
WHERE gs.stereotype='grafana-source'`;

export const SELECT_API_SOURCES = `WITH RECURSIVE cte_src AS (
	SELECT
		t.object_id as target_id,
		src.object_id as source_id
	FROM t_object t 
		JOIN t_connector c ON c.end_object_id=t.object_id AND c.connector_type='Realisation'
		JOIN t_object src ON src.object_id=c.start_object_id AND src.stereotype='grafana-source'
), cte_r AS (
	SELECT 
	 	c.start_object_id,
		 o.*
	FROM t_connector c
		JOIN t_object o ON o.object_id=c.end_object_id AND o.status<>'REMOVED' 
	WHERE c.connector_type='Realisation'
)
SELECT
	app.alias as app_code,
	app.name as app, 
	app_s.source_id as app_source_id,
	c2.alias as container_code, c2.name,c2.status as c2_status, 
	c_s.source_id as container_source_id,
	api.alias as api_code, 
	api.name AS api_name, 
	api.status AS api_status,
	i_s.source_id as api_source_id,
	tc.alias as tc_code,
	tc.name as tc
FROM t_object app
	LEFT JOIN cte_r c2 ON c2.start_object_id=app.object_id AND c2.stereotype='C4_Container'
	LEFT JOIN cte_r api ON api.start_object_id=c2.object_id
	LEFT JOIN t_connector ct ON ct.start_object_id = api.object_id AND ct.connector_type='Realisation'
	LEFT JOIN t_object tc ON tc.object_id=ct.end_object_id AND tc.stereotype='ArchiMate_TechnicalCapability'
	LEFT JOIN cte_src app_s ON app_s.target_id=app.object_id
	LEFT JOIN cte_src c_s ON c_s.target_id=c2.object_id
	LEFT JOIN cte_src i_s ON i_s.target_id=api.object_id
WHERE app.alias=$1
	AND app.stereotype='softwareSystem'`;

export const SELECT_PROVIDED_API_SOURCES = `WITH RECURSIVE cte_src AS (
	SELECT
		t.object_id as target_id,
		src.object_id as source_id
	FROM t_object t 
		JOIN t_connector c ON c.end_object_id=t.object_id AND c.connector_type='Realisation'
		JOIN t_object src ON src.object_id=c.start_object_id AND src.stereotype='grafana-source'
)
SELECT 
		api.name,
		api.alias as code,
		api.ea_guid,
		api.object_id,
		src.source_id AS api_source_id
	FROM t_object app
		JOIN t_object pi ON pi.parentid=app.object_id
		JOIN t_object api ON api.object_id=pi.classifier
		LEFT JOIN cte_src src ON src.target_id=api.object_id
		LEFT JOIN cte_src app_s ON app_s.target_id=app.object_id
WHERE app.alias=$1
	AND app.stereotype='softwareSystem'`;