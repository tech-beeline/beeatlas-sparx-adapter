
export const SELECT_ALL_METHODS = `SELECT DISTINCT
	it.alias as interface_code,
	it.object_id as interface_id,
	it.name as interface_name,
	m.ea_guid as operation_guid,
	m.notes as description,
	m.name,
	m.type as "returnType",
	m.operationid,
	rps.value as rps,
	latency.value as latency,
	error_rate.value as error_rate,
	removed_date.value as removed_date,
	implements.value as implements,
	(SELECT 1 
		FROM t_connectortag t
		JOIN t_connector c ON c.connector_id=t.elementid
	WHERE t.value=m.ea_guid AND t.property='operation_guid'
	LIMIT 1) AS used
FROM t_object it
	JOIN t_operation m ON m.object_id=it.object_id
	LEFT JOIN t_operationtag rps ON rps.elementid=m.operationid AND rps.property='rps'
	LEFT JOIN t_operationtag latency ON latency.elementid=m.operationid AND latency.property='latency'
	LEFT JOIN t_operationtag error_rate ON error_rate.elementid=m.operationid AND error_rate.property='error_rate'
	LEFT JOIN t_operationtag removed_date ON removed_date.elementid=m.operationid AND removed_date.property='removedDate'
	LEFT JOIN t_operationtag implements ON implements.elementid=m.operationid AND implements.property='implements'
WHERE it.object_type='Interface'`;

export const SELECT_INTERFACE_METHODS = `${SELECT_ALL_METHODS} AND LOWER(it.alias) = LOWER($1)`;
export const SELECT_INTERFACE_METHODS_BY_ID = `${SELECT_ALL_METHODS} AND it.object_id = $1`;

export const SELECT_METHOD_BY_NAME_INTERFACE_CODE = `SELECT o.* 
FROM t_operation o
	JOIN t_object api ON api.object_id=o.object_id
WHERE LOWER(api.alias)=LOWER($1) AND LOWER(o.name)=LOWER($2)`


export const SELECT_METHOD_BY_NAME_INTERFACE_ID = `SELECT o.*
FROM t_operation o
WHERE o.object_id=$1 AND LOWER(o.name)=LOWER($2)`

export const INSERT_INTERFACE_METHOD = `WITH cte_interface AS
(
	SELECT object_id FROM t_object WHERE object_type='Interface' AND alias=$1
)
INSERT INTO t_operation(
	object_id,
	name,
	notes,
	type,
	scope, 
	concurrency,
	isroot,
	isleaf,
	isquery,
	pure,
	ea_guid
)
SELECT
	object_id,
	$2,$3,$4,
	'Public',
	'Sequential',
	0,
	0,
	0,
	0,
	UPPER('{' || gen_random_uuid() || '}')
FROM cte_interface
RETURNING operationid
`;

export const UPDATE_OPERATION = `WITH cte_interface AS
(
	SELECT object_id FROM t_object WHERE object_type='Interface' AND alias=$1
)
UPDATE t_operation
SET 
	notes=$3,
	type=$4
FROM cte_interface
WHERE t_operation.object_id=cte_interface.object_id
	AND t_operation.name=$2
RETURNING t_operation.operationid`;

export const SELECT_METHOD_SLA = `SELECT
	rps.value AS rps,
	latency.value AS latency,
	error_rate.value AS error_rate
FROM t_operation o
	LEFT JOIN t_operationtag rps ON rps.elementid=o.operationid AND rps.property='rps'
	LEFT JOIN t_operationtag latency ON latency.elementid=o.operationid AND latency.property='latency'
	LEFT JOIN t_operationtag error_rate ON error_rate.elementid=o.operationid AND error_rate.property='error_rate'
WHERE operationid=$1`;

export const CHECK_METHOD_USAGE = `SELECT
 1
FROM t_operation m
	JOIN t_connectortag og ON og.value=m.ea_guid AND og.property='operation_guid'
	JOIN t_connector c ON c.connector_id=og.elementid
	JOIN t_diagram d ON d.diagram_id=c.diagramid
WHERE m.operationid=$1
LIMIT 1`;

export const SELECT_PAPI_MAPPING = `WiTH cte_realization AS ( select 
    DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation'
), cte_papi AS (
	SELECT 
		app.object_id as app_id,
		api.name,
		api.alias as api_code,
		api.ea_guid,
		api.object_id,
		m.name as method_name,
		m.ea_guid as method_uid,
		m.notes as method_description,
		rps.value as rps,
		latency.value as latency,
		error_rate.value as error_rate
	FROM t_object app
		JOIN t_object pi ON pi.parentid=app.object_id
		JOIN t_object api ON api.object_id=pi.classifier
		JOIN t_operation m ON m.object_id=api.object_id
		LEFT JOIN t_operationtag rps ON rps.elementid=m.operationid AND rps.property='rps'
		LEFT JOIN t_operationtag latency ON latency.elementid=m.operationid AND latency.property='latency'
		LEFT JOIN t_operationtag error_rate ON error_rate.elementid=m.operationid AND error_rate.property='error_rate'
	WHERE app.stereotype='softwareSystem' 
), cte_c4_api AS (
	SELECT 
		m.name AS method_name,
		m.ea_guid AS method_uid,
		app.name as app_name,
		app.alias as app_code,
		app.object_id AS app_id,
		cn.alias as container_code,
		cn.name as container_name,
		it.alias as code,
		it.name AS api_name,
		rps.value AS rps,
		latency.value AS latency,
		error_rate.value AS error_rate
	FROM t_object app 
		JOIN cte_realization cn ON cn.start_object_id=app.object_id AND cn.stereotype='C4_Container'
		JOIN cte_realization it ON it.start_object_id=cn.object_id AND it.object_type='Interface' AND it.alias IS NOT NULL
		JOIN t_operation m ON m.object_id=it.object_id
		LEFT JOIN t_operationtag rps ON rps.elementid=m.operationid AND rps.property='rps'
		LEFT JOIN t_operationtag latency ON latency.elementid=m.operationid AND latency.property='latency'
		LEFT JOIN t_operationtag error_rate ON error_rate.elementid=m.operationid AND error_rate.property='error_rate'
	WHERE app.stereotype='softwareSystem'
)
SELECT DISTINCT
	p.method_name,
	p.method_uid,
	p.rps as manual_rps,
	p.latency as manual_latency,
	p.error_rate as manual_error_rate,
	c4.method_uid AS c4_method_uid,
	c4.code,
	c4.rps,
	c4.latency,
	c4.error_rate
FROM cte_papi p
	JOIN cte_c4_api c4 ON LOWER(c4.method_name)=LOWER(p.method_name) AND c4.app_id=p.app_id`;

export const SELECT_PAPI_MAPPING_BY_NAMES = `${SELECT_PAPI_MAPPING}
	WHERE p.method_uid=ANY($1)`;


export const SELECT_METHODS = `WITH cte_realization AS ( 
	SELECT
    	DISTINCT r.start_object_id AS parent_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation')
SELECT 
	app.alias AS app_code,
	c.alias AS container_code,
	c.object_id as container_id,
	api.alias AS interface_code,
	api.object_id as interface_id,
	op.name, 
	op.ea_guid AS operation_guid,
	op.type AS "returnType",
	op.notes AS description,
	error_rate.value AS error_rate,
	rps.value AS rps,
	latency.value AS latency,
	rd.value AS removed_date,
	implements.value AS implements
FROM t_object app 
	JOIN cte_realization c ON c.parent_id=app.object_id AND c.stereotype='C4_Container'
	JOIN cte_realization api ON api.parent_id=c.object_id AND api.object_type='Interface'
	LEFT JOIN t_operation op ON op.object_id=api.object_id
	LEFT JOIN t_operationtag error_rate ON error_rate.elementid=op.operationid AND error_rate.property='error_rate'
	LEFT JOIN t_operationtag rps ON rps.elementid=op.operationid AND rps.property='rps'
	LEFT JOIN t_operationtag latency ON latency.elementid=op.operationid AND latency.property='latency'
	LEFT JOIN t_operationtag rd ON rd.elementid=op.operationid AND rd.property='removedDate'
	LEFT JOIN t_operationtag implements ON implements.elementid=op.operationid AND implements.property='implements'
WHERE app.stereotype='softwareSystem'`;