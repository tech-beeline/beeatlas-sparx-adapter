export const DELETE_ALL_OBJECTS_LINKS = `
WITH cte_c AS (
	SELECT 
		c.connector_id
	FROM t_connector c 
	WHERE (c.start_object_id=$1 OR c.end_object_id=$1) AND (c.start_object_id=$2 OR c.end_object_id=$2)
)
DELETE FROM t_diagramlinks WHERE connectorid IN (SELECT connector_id FROM cte_c)`;

export const DELETE_ALL_OBJECTS_CONNECTORS = `
DELETE FROM t_connector
WHERE (start_object_id=$1 OR end_object_id=$1) AND (start_object_id=$2 OR end_object_id=$2)`;