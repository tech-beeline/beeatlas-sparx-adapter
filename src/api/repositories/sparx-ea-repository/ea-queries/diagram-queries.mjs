const SELECT_DIAGRAM_OBJECTS =
    `SELECT 
	dob.recttop,
	dob.rectleft,
	dob.rectright,
	dob.rectbottom,
	dob.sequence,
	dob.objectstyle,
	dob.instance_id,
	c.*
FROM t_diagramobjects dob
	JOIN t_object c ON c.object_id=dob.object_id
WHERE dob.diagram_id=$1`;

export const DELETE_LINK_BY_CONNECTOR_ID = `DELETE FROM t_diagramlinks WHERE connectorid=$1`;
export const DELETE_CONNECTOR_BY_ID = `DELETE FROM t_connector WHERE connector_id=$1`;