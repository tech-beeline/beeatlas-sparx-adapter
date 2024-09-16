
export const SELECT_INTERFACE_METHODS = `SELECT 
    it.alias as interface_code,
    m.name
FROM t_object it
    JOIN t_operation m ON m.object_id=it.object_id
WHERE it.object_type='Interface' AND it.alias = $1`;

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