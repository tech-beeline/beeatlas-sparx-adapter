export const SELECT_SCENARIO_MESSAGES = `WITH RECURSIVE
cte_diagram_link AS
(
	SELECT 
		od.diagram_id, 
		o.object_id, 
		d.diagram_id AS child_diagram_id,
		d.ea_guid,
		d.name
	FROM t_xref x
		JOIN t_object o ON o.ea_guid=x.client
		JOIN t_diagram d ON d.ea_guid=x.supplier AND d.diagram_type='Sequence'
		JOIN t_diagramobjects od ON od.object_id=o.object_id AND od.diagram_id <> d.diagram_id
	WHERE x.name='DefaultDiagram'
),
cte_diagrams AS
(
	SELECT 
		diagram_id as e2e_id, 
		diagram_id as diagram_id, 
		ea_guid as e2e_uid,
		ea_guid,
		name,
		0 as object_id
	FROM t_diagram WHERE diagram_type='Sequence'
	UNION DISTINCT
	SELECT
		d.e2e_id, 
		r.child_diagram_id, 
		d.e2e_uid,
		r.ea_guid,
		r.name,
		r.object_id
	FROM cte_diagram_link r
		JOIN cte_diagrams d on d.diagram_id=r.diagram_id 
)
SELECT 
	ld.ea_guid as linked_diagram_uid,
	ms.name as method,
	rps.value as rps,
	latency.value as latency,
	error_rate.value as error_rate,
	COALESCE( api.name, srv.name) AS api_name,
	show_e2e.value as show_in_e2e,
	api.object_id as api_id,
	d.ea_guid as diagram_uid, 
	d.name as diagram, 
	m.name, 
	m.ea_guid as uid,
	m.start_object_id as client_id, 
	cl.name as client_name,
	m.end_object_id as server_id, 
	srv.name as server_name,
	m.stereotype, 
	m.ea_guid, 
	m.notes,
	op.value as operation_guid,
	m.seqno, 
	m.pdata1 = 'Synchronous' as is_sync, 
	m.pdata4 as is_ret
FROM cte_diagrams d
	JOIN t_connector m ON m.diagramid=d.diagram_id
	JOIN t_object srv ON srv.object_id=m.end_object_id
	JOIN t_object cl ON cl.object_id=m.start_object_id
	LEFT JOIN t_connectortag op ON op.elementid=m.connector_id AND op.property='operation_guid'
	LEFT JOIN t_operation ms ON ms.ea_guid=op.value
	LEFT JOIN t_object api ON api.object_id=ms.object_id
	LEFT JOIN t_objectproperties show_e2e ON show_e2e.object_id=api.object_id AND show_e2e.property='show_in_e2e'
	LEFT JOIN t_operationtag rps ON rps.elementid=ms.operationid AND rps.property='rps'
	LEFT JOIN t_operationtag latency ON latency.elementid=ms.operationid AND latency.property='latency'
	LEFT JOIN t_operationtag error_rate ON error_rate.elementid=ms.operationid AND error_rate.property='error_rate'
	LEFT JOIN t_xref x ON x.client=srv.ea_guid AND x.name='DefaultDiagram'
	LEFT JOIN t_diagram ld ON ld.ea_guid=x.supplier AND ld.diagram_type='Sequence'
WHERE d.e2e_uid=$1`