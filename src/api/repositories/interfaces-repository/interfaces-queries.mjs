import { REALIZATION_CONNECTOR } from "../index.mjs";
import { CONTAINER_STEREOTYPE } from "../systems-repository/const.mjs"
import { API_SPECFICATION_TAG } from "./const.mjs";

export const SELECT_ALL_CONTAINERS_INTERFACES = `WiTH cte_realization AS ( select 
    DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation')
SELECT 
	cn.alias as container_code,
	cn.name as container_name,
	it.alias as code,
	it.name,
	it.note as description,
	it.version,
	it.status,
	spec.value as specification,
	(SELECT	tc.alias
			FROM t_connector r 
			JOIN t_object tc ON tc.object_id=r.end_object_id AND tc.stereotype='ArchiMate_TechnicalCapability'
	WHERE r.start_object_id=it.object_id AND r.connector_type='${REALIZATION_CONNECTOR}'
	LIMIT 1) as "tcCode"
FROM t_object cn
	JOIN cte_realization it ON it.start_object_id=cn.object_id AND it.object_type='Interface'
	LEFT JOIN t_objectproperties spec ON spec.object_id=it.object_id AND spec.property='${API_SPECFICATION_TAG}'
WHERE cn.stereotype='${CONTAINER_STEREOTYPE}'`

export const SELECT_CONTAINER_INTERFACES = `${SELECT_ALL_CONTAINERS_INTERFACES} AND LOWER(cn.alias)=LOWER($1)`;

export const SELECT_API_TC = `SELECT
	tc.name,tc.alias as code, tc.object_id
FROM t_object it
	JOIN t_connector r ON r.start_object_id=it.object_id AND r.connector_type='${REALIZATION_CONNECTOR}'
	JOIN t_object tc ON tc.object_id=r.end_object_id AND tc.stereotype='ArchiMate_TechnicalCapability'
WHERE it.object_id=$1`;