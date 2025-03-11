export const DELETE_OBJECT = {
    t_objectproperties: 'DELETE FROM t_objectproperties WHERE object_id=$1',
    t_xref: 'DELETE FROM t_xref WHERE client=(SELECT ea_guid FROM t_object WHERE object_id=$1) OR supplier=(SELECT ea_guid FROM t_object WHERE object_id=$1)',
    t_diagramlinks: `DELETE FROM t_diagramlinks
WHERE connectorid IN (
	SELECT c.connector_id 
	FROM t_object o 
		JOIN t_connector c ON c.start_object_id=o.object_id OR c.end_object_id=object_id
	WHERE object_id=$1)`,
    t_connectortag: `DELETE FROM t_connectortag
WHERE elementid IN (
	SELECT c.connector_id 
	FROM t_object o 
		JOIN t_connector c ON c.start_object_id=o.object_id OR c.end_object_id=object_id
	WHERE object_id=$1)`,
    t_connectorconstraint: `DELETE FROM t_connectorconstraint
WHERE connectorid IN (
	SELECT c.connector_id 
	FROM t_object o 
		JOIN t_connector c ON c.start_object_id=o.object_id OR c.end_object_id=object_id
	WHERE object_id=$1)`,
    t_connector: `DELETE FROM t_connector
WHERE connector_id IN (
	SELECT c.connector_id 
	FROM t_object o 
		JOIN t_connector c ON c.start_object_id=o.object_id OR c.end_object_id=object_id
	WHERE object_id=$1)`,
    t_diagramobjects: 'DELETE FROM t_diagramobjects WHERE object_id=$1',
    t_objectconstraint: 'DELETE FROM t_objectconstraint WHERE object_id=$1',
    t_diagram: 'DELETE FROM t_diagram WHERE parentid=$1',
    t_object: `DELETE FROM t_object WHERE object_id=$1`
};