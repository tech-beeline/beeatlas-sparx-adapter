export const SELECT_MESSAGESBY_DIAGRAM_ID_LIST = `SELECT
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