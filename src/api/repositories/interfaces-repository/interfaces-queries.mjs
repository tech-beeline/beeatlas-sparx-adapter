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
	it.status
FROM t_object cn
	JOIN cte_realization it ON it.start_object_id=cn.object_id AND it.object_type='Interface'
WHERE cn.stereotype='C2'`

export const SELECT_CONTAINER_INTERFACES = `${SELECT_ALL_CONTAINERS_INTERFACES} AND cn.alias=$1`