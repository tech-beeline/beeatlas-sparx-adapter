export const SELECT_OBJECT_RELATIONS = `SELECT
	o.object_id,
	(SELECT count(*) FROM t_connector c WHERE c.start_object_id=o.object_id OR c.end_object_id=o.object_id) rel_count,
	(SELECT count(*) FROM t_diagramobjects c WHERE c.object_id=o.object_id) dia_count,
	(SELECT count(*) FROM t_object c WHERE c.parentid=o.object_id) parent_count,
	(SELECT count(*) FROM t_object c WHERE c.classifier=o.object_id OR c.classifier_guid=o.ea_guid) cls_count,
	(
		SELECT
			count(*)
		FROM t_connectortag t
			JOIN t_connector c ON c.connector_id=t.elementid AND c.connector_type='Sequence'
			JOIN t_diagram d ON d.diagram_id=c.diagramid
		WHERE t.value=o.ea_guid AND t.property='operation_guid'
	) msg_count
FROM t_object o
WHERE o.object_id=$1`