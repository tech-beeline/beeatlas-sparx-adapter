import { APP_CATALOG_ROOT } from '../../../resources/const.mjs';


export const CTE_SYSTEM_CATALOG = `cte_sys_catalog AS (
	SELECT 
		p.package_id, p.parent_id, p.name, p.name::text as "FQName"
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='ApplicationCatalogue'
	UNION
	SELECT c.package_id, p.parent_id, c.name, p."FQName"::text || '/' || c.name
    FROM cte_sys_catalog p
    	JOIN t_package c ON c.parent_id=p.package_id
)`;

export const CTE_SYSTEMS = `${CTE_SYSTEM_CATALOG}, 
cte_systems AS (
    SELECT sys.object_id, sys.name, sys.ea_guid, sys.alias AS code, sys.note AS sys_description, sys.author, sys.status, sys.modifiedDate AS "modifiedDate", sys.version,
		cat."FQName" || '/' || sys.name AS "FQName", cat.name AS "packageName"
		FROM cte_sys_catalog cat
		JOIN t_object sys ON sys.package_id=cat.package_id AND sys.object_type='Component' AND sys.alias is not null AND sys.stereotype IS null)
`;

export const CTE_REALIZATION = `cte_realization AS ( select 
    DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation')`;