import eaRepository from "../../sparx-ea-repository/ea-repository.mjs";

const SELECT_METHODS = `WITH cte_realization AS ( 
	SELECT
    	DISTINCT r.start_object_id AS parent_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation')
SELECT 
	app.alias AS app_code,
	c.alias AS container_code,
	c.object_id as container_id,
	api.alias AS interface_code,
	api.object_id as interface_id,
	op.name, 
	op.operationid,
	op.ea_guid AS operation_guid,
	op.type AS "returnType",
	op.notes AS description,
	error_rate.value AS error_rate,
	rps.value AS rps,
	latency.value AS latency,
	rd.value AS removed_date,
	implements.value AS implements
FROM t_object app 
	JOIN cte_realization c ON c.parent_id=app.object_id AND c.stereotype='C4_Container'
	JOIN cte_realization api ON api.parent_id=c.object_id AND api.object_type='Interface'
	JOIN t_operation op ON op.object_id=api.object_id
	LEFT JOIN t_operationtag error_rate ON error_rate.elementid=op.operationid AND error_rate.property='error_rate'
	LEFT JOIN t_operationtag rps ON rps.elementid=op.operationid AND rps.property='rps'
	LEFT JOIN t_operationtag latency ON latency.elementid=op.operationid AND latency.property='latency'
	LEFT JOIN t_operationtag rd ON rd.elementid=op.operationid AND rd.property='removedDate'
	LEFT JOIN t_operationtag implements ON implements.elementid=op.operationid AND implements.property='implements'
WHERE app.stereotype='softwareSystem'`;

class MethodEntity {
	app_code;
	container_code;
	container_id;
	interface_code;
	interface_id;
	name;
	operation_guid;
	returnType;
	description;
	error_rate;
	latency;
	rps;
	removed_date;
	implements;
	key;
}


/**
 * 
 * @returns {Promise<MethodEntity[]>}
 */
export const selectAllMethods = async () => eaRepository.query(SELECT_METHODS);

/**
 * 
 * @returns {Promise<MethodEntity[]>}
 */
export const selectAppMethods = async (code) => eaRepository.query(`${SELECT_METHODS} AND LOWER(app.alias)=$1`, code.toLowerCase());

export const selectInterfaceMethods = async (interface_id) => eaRepository.query(`${SELECT_METHODS} AND api.object_id=$1`, interface_id);