export const SELECT_MESSAGES_BY_DIAGRAM_ID_LIST = `SELECT
	msg.diagramid as diagram_id,
	msg.name,
	msg.connector_id,
	msg.seqno,
	supplier.object_id AS supplier_id,
	supplier.name AS supplier_name,
	client.object_id AS client_id,
	client.name AS client_name,
	op_guid.value as operation_guid,
	op.name as operation,
	op.operationid AS operation_id,
	api.object_id as interface_id,
	api.alias as interface_code,
	api.name as interface_name
FROM t_connector msg
	JOIN t_object supplier ON supplier.object_id=msg.end_object_id
	JOIN t_object client ON client.object_id=msg.start_object_id
	LEFT JOIN t_connectortag op_guid ON op_guid.elementid=msg.connector_id
	LEFT JOIN t_operation op ON op.ea_guid=op_guid.value
	LEFT JOIN t_object api ON api.object_id=op.object_id
WHERE msg.diagramid = ANY($1)`;


export const SELECT_SCENARIO_SEQUENCE_MESSAGES = `WITH RECURSIVE cte_child AS (
	SELECT 
		od.diagram_id,
		o.object_id, 
		o.object_type,
		o.name,
		d.diagram_id AS child_diagram_id, 
		d.diagram_type,
		d.ea_guid AS child_diagram_uid
	FROM t_xref x
		JOIN t_object o ON o.ea_guid=x.client
		JOIN t_diagram d ON d.ea_guid=x.supplier AND d.diagram_type='Sequence'
		JOIN t_diagramobjects od ON od.object_id=o.object_id AND od.diagram_id <> d.diagram_id
	WHERE x.name='DefaultDiagram'
),
cte_tree AS (
	SELECT 
		diagram_id AS parent_id, 
		diagram_id AS diagram_id, 
		ea_guid AS parent_uid, 
		ea_guid AS diagram_uid, 
		0 as object_id
	FROM t_diagram 
		WHERE diagram_type='Sequence'
	UNION DISTINCT
	SELECT 
		d.parent_id, 
		r.child_diagram_id, 
		d.parent_uid, 
		r.child_diagram_uid, 
		r.object_id
	FROM cte_tree d
		JOIN cte_child r ON r.diagram_id=d.diagram_id
), cte_msg AS (
SELECT
	d.diagram_id,
	m.seqno,
	m.connector_type,
	m.name as message,
	m.pdata1='Synchronous' as is_sync,
	client.name as cl_api_name,
	client.object_id as cl_api_id,
	COALESCE(cl_parent.name,client.name) as client_name,
	COALESCE(cl_parent.alias,client.alias) as client_code,
	srv.name as api_name,
	srv.object_id as api_id,
	COALESCE(srv_parent.name,srv.name ) as server_parent,
	COALESCE(srv_parent.alias,srv.alias ) as server_code,
	o_uid.value as operation_guid,
	op.name as method_name,
	rps.value as rps,
	latency.value as latency,
	error_rate.value as error_rate
FROM t_diagram d
	JOIN t_connector m ON m.diagramid=d.diagram_id AND m.start_object_id <> m.end_object_id
	JOIN t_object client ON client.object_id=m.start_object_id
	LEFT JOIN t_object cl_parent ON cl_parent.object_id=client.parentid
	JOIN t_object srv ON srv.object_id=m.end_object_id
	LEFT JOIN t_object srv_parent ON srv_parent.object_id=srv.parentid
	LEFT JOIN t_connectortag o_uid ON o_uid.elementid=m.connector_id AND o_uid.property='operation_guid'
	LEFT JOIN t_operation op ON op.ea_guid=o_uid.value
	LEFT JOIN t_operationtag rps ON rps.elementid=op.operationid AND rps.property='rps'
	LEFT JOIN t_operationtag latency ON latency.elementid=op.operationid AND latency.property='latency'
	LEFT JOIN t_operationtag error_rate ON error_rate.elementid=op.operationid AND error_rate.property='error_rate'
	WHERE m.pdata4='0'
)
SELECT 
	t.diagram_uid, m.*
FROM cte_tree t
	JOIN cte_msg m ON m.diagram_id=t.diagram_id
WHERE t.parent_uid=$1 
`