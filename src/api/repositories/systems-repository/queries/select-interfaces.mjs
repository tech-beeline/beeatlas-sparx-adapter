import eaRepository from "../../sparx-ea-repository/ea-repository.mjs"

const QUERY_ALL = `WITH cte_realization AS ( select 
    DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation')
SELECT 
	app.name as app_name,
	app.alias as app_code,
	cn.alias as container_code,
	cn.name as container_name,
	cn.note AS container_description,
	cn.version AS container_version,
	cn.author AS container_author,
	cn.status AS container_status,
	cn.createddate,
	cn.modifieddate,
	cn.object_id as container_id,
	it.name as interface_name,
	it.alias AS interface_code,
	it.note as description,
	it.version as interface_version,
	it.status as interface_status,
	it.object_id as interface_id,
	spec.value as specification,
	protocol.value as protocol,
	(SELECT	tc.alias
			FROM t_connector r 
			JOIN t_object tc ON tc.object_id=r.end_object_id AND tc.stereotype='ArchiMate_TechnicalCapability'
	WHERE r.start_object_id=it.object_id AND r.connector_type='Realisation'
	LIMIT 1) as "tcCode"
FROM t_object app
	JOIN cte_realization cn ON cn.start_object_id=app.object_id AND cn.stereotype='C4_Container'
	LEFT JOIN cte_realization it ON it.start_object_id=cn.object_id
	LEFT JOIN t_objectproperties spec ON spec.object_id=it.object_id AND spec.property='specification'
	LEFT JOIN t_objectproperties protocol ON protocol.object_id=it.object_id AND protocol.property='protocol'
WHERE  app.stereotype='softwareSystem'`

export class InterfaceEntity {
    app_name;
    app_code;
    container_code;
	container_id;
    container_name;
    interface_code;
    interface_name;
    description;
    version;
    status;
    object_id;
    interface_id;
    specification;
    protocol;
    tcCode;
}

/**
 * 
 * @returns {Promise<InterfaceEntity[]>}
 */
export const selectAllInterfaces = async () => eaRepository.query(QUERY_ALL);

/**
 * 
 * @returns {Promise<InterfaceEntity[]>}
 */
export const selectAppInterfaces = async (code) => eaRepository.query(`${QUERY_ALL} AND LOWER(app.alias)=$1`, code.toLowerCase());