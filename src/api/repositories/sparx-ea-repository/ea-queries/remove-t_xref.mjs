export const REMOVE_CONNECTOR_TXREF_BY_START_END_STEREOTYPE = `DELETE FROM t_xref 
WHERE client IN (SELECT ea_guid FROM t_connector WHERE start_object_id=$1 AND end_object_id=$2 AND stereotype=$3)`;

export const REMOVE_CONNECTORS_TAGS = `DELETE FROM t_connectortag 
WHERE elementid IN (SELECT connector_id FROM t_connector WHERE start_object_id=$1 AND end_object_id=$2 AND connector_type=$3)`;