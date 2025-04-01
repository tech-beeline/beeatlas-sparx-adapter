
export const SELECT_ALL_METHODS = `SELECT 
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
	removed_date.value as removed_date
FROM t_object it
	JOIN t_operation m ON m.object_id=it.object_id
	LEFT JOIN t_operationtag rps ON rps.elementid=m.operationid AND rps.property='rps'
	LEFT JOIN t_operationtag latency ON latency.elementid=m.operationid AND latency.property='latency'
	LEFT JOIN t_operationtag error_rate ON error_rate.elementid=m.operationid AND error_rate.property='error_rate'
	LEFT JOIN t_operationtag removed_date ON removed_date.elementid=m.operationid AND removed_date.property='removedDate'
WHERE it.object_type='Interface'
`

export const SELECT_INTERFACE_METHODS = `${SELECT_ALL_METHODS} AND LOWER(it.alias) = LOWER($1)`;
export const SELECT_INTERFACE_METHODS_BY_ID = `${SELECT_ALL_METHODS} AND it.object_id = $1`;

export const SELECT_METHOD_BY_NAME_INTERFACE_CODE = `SELECT o.* 
FROM t_operation o
	JOIN t_object api ON api.object_id=o.object_id
WHERE LOWER(api.alias)=LOWER($1) AND o.name=$2`


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

export const SELECT_INTERFACE_METHOD = `SELECT
	*
FROM t_operation 
WHERE object_id=$1
	AND LOWER(name)=LOWER($2)
`

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