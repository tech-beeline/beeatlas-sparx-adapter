import { APP_CATALOG_ROOT } from '../../../resources/const.mjs';

export const CTE_SYS_PACKAGE = `cte_sys_package AS (
	SELECT 
		p.package_id, p.name, o.alias as code
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='TechCapabilitiesCatalogue'
	UNION
	SELECT 
		p.package_id, p.name, o.alias
	FROM cte_sys_package parent
		JOIN t_package p ON p.parent_id=parent.package_Id
		JOIN t_object o ON o.ea_guid=p.ea_guid
	
)`;

export const CTE_SYS_CATALOG = `cte_sys_catalog AS (
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

export const CTE_LANDSCAPE = `
${CTE_SYS_PACKAGE},
${CTE_SYS_CATALOG},
cte_landscape AS (
	SELECT
		sys.name, 
		sys.alias as code, 
		sys.note as description, 
		sys.status, sys.author,
		sys.modifiedDate AS "modifiedDate", 
		sys.version, 
		sp.package_id
	FROM cte_sys_catalog c
		JOIN t_object sys ON sys.package_id=c.package_id AND sys.alias IS NOT NULL
		LEFT JOIN cte_sys_package sp ON sp.code=sys.alias
)`;

export const CTE_SYSTEMS = `${CTE_SYS_CATALOG}, 
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