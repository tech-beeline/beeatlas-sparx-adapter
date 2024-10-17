
export const SELECT_ALL_METHODS = `SELECT 
	it.alias as interface_code,
	it.name as interface_name,
	m.name,
	m.type as "returnType",
	rps.value as rps,
	latency.value as latency,
	error_rate.value as error_rate
FROM t_object it
	JOIN t_operation m ON m.object_id=it.object_id
	LEFT JOIN t_operationtag rps ON rps.elementid=m.operationid AND rps.property='rps'
	LEFT JOIN t_operationtag latency ON latency.elementid=m.operationid AND latency.property='latency'
	LEFT JOIN t_operationtag error_rate ON error_rate.elementid=m.operationid AND error_rate.property='error_rate'
WHERE it.object_type='Interface'
`

export const SELECT_INTERFACE_METHODS = `${SELECT_ALL_METHODS} AND it.alias = $1`;

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
	pure
)
SELECT
	object_id,
	$2,$3,$4,
	'Public',
	'Sequential',
	0,
	0,
	0,
	0
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