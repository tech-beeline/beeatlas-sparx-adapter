const SELECT_CONTAINER_SYS_CTE = `cte_sys AS (
SELECT package_id , $1 as name FROM t_object WHERE object_type='Component' AND alias=$2 )`;

const SELECT_INTERFACE_SYS_CTE = `cte_sys AS (
SELECT s.package_id , $1 as name 
FROM t_object o
	JOIN t_package p ON p.package_id=o.package_id
	JOIN t_package s ON s.package_id=p.parent_id
WHERE stereotype='C2' AND alias=$2)`

const PREPARE_EXPR = `cte_new_package AS (
	INSERT INTO t_package(
		name, parent_id
	)
	SELECT s.name, s.package_id
	FROM cte_sys s
	WHERE NOT EXISTS(
		SELECT 1 FROM t_package WHERE name=s.name AND parent_id=s.package_id
	)
	RETURNING ea_guid, package_id, parent_id, name
),
cte_new_obj AS (
	INSERT INTO t_object(
		name,
		ea_guid,
		object_type,
		package_id,
		pdata1,
		author,
		version,
		status
	)
	SELECT
		p.name,
		p.ea_guid,
		'Package',
		p.parent_id,
		p.package_id,
		'FDM API',
		'1.0',
		'Proposed'
	FROM cte_new_package p
	RETURNING pdata1::INTEGER AS package_id
)
SELECT n.package_id 
FROM cte_new_obj n
UNION DISTINCT
SELECT p.package_id 
FROM cte_sys s
	JOIN t_package p ON p.parent_id=s.package_id AND p.name=s.name`;

export const PREPARE_CONTAINERS_PACKAGE = `WITH 
${SELECT_CONTAINER_SYS_CTE},
${PREPARE_EXPR}`;

export const PREPARE_INTERFACES_PACKAGE
 = `WITH 
${SELECT_INTERFACE_SYS_CTE},
${PREPARE_EXPR}`;