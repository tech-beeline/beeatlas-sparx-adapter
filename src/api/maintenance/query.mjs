export const SELECT_METHOD_DOUBLES =`WITH RECURSIVE cte_pkg AS (
	SELECT name, package_id, name::text as fqname
	FROM t_package 
	WHERE ea_guid='{E9DA9B76-13A2-4eb0-8BDF-238BEEE8E90A}'
	UNION 
	SELECT c.name, c.package_id, p.fqname || '/' || c.name
	FROM cte_pkg p
		JOIN t_package c ON c.parent_id=p.package_id
	
),
cte_dbl AS (
	SELECT
		LOWER(name) as name, 
		object_id
	FROM t_operation m
	GROUP BY LOWER(name), object_id
	HAVING count(*) > 1
), cte_args AS (
	SELECT operationid,count(*), string_agg( name||':'||type, ',' ORDER BY pos) as args
	FROM t_operationparams
	GROUP BY operationid
)
SELECT DISTINCT
	m.name as method,
	a.args as parameters,
	m.ea_guid as operation_guid,
	api.name as interface, 
	api.alias as code,
	p.fqname as fqname,
	api.ea_guid as api_uid,
	rps.value as rps,
	latency.value as latency,
	error_rate.value as error_rate,
	rd.value as removed_date,
	msg.name as message,
	msg.diagramid as diagram_id,
	f.name as diagram,
	f.ea_guid as diagram_uid
FROM cte_dbl d
	JOIN t_operation m ON LOWER(m.name)=d.name AND m.object_id=d.object_id
	JOIN t_object api ON api.object_id=m.object_id
	JOIN cte_pkg p ON p.package_id=api.package_id
	LEFT JOIN cte_args a ON a.operationid=m.operationid
	LEFT JOIN t_operationtag rps ON rps.elementid=m.operationid AND rps.property='rps'
	LEFT JOIN t_operationtag latency ON latency.elementid=m.operationid AND latency.property='latency'
	LEFT JOIN t_operationtag error_rate ON error_rate.elementid=m.operationid AND error_rate.property='error_rate'
	LEFT JOIN t_operationtag rd ON rd.elementid=m.operationid AND rd.property='removed_date'
	LEFT JOIN t_connectortag t ON t.property='operation_guid' AND t.value=m.ea_guid
	LEFT JOIN t_connector msg ON connector_id=t.elementid
	LEFT JOIN t_diagram f ON f.diagram_id=msg.diagramid
ORDER BY method, api_uid`;