import { CONTAINERS_SUBPACKAGE_NAME, INTERFACES_SUBPACKAGE_NAME } from "../const.mjs";

export const SELECT_SYSTEMS = `WITH RECURSIVE cte_sys_catalog AS (
	SELECT 
		p.package_id, p.parent_id, p.name, p.name::text as "FQName"
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='ApplicationCatalogue'
	UNION
	SELECT c.package_id, p.parent_id, c.name, p."FQName"::text || '/' || c.name
    FROM cte_sys_catalog p
    	JOIN t_package c ON c.parent_id=p.package_id
)
SELECT
		sys.name, 
		sys.alias as code, 
		sys.note as description, 
		sys.status, 
		sys.author,
		c."FQName",
		sys.modifiedDate AS "modifiedDate", 
		sys.version
	FROM cte_sys_catalog c
		JOIN t_object sys ON sys.package_id=c.package_id 
		AND sys.alias IS NOT NULL 
		AND sys.object_type='Component' 
		AND sys.stereotype='softwareSystem'`;

export const SELECT_SYSTEM_BY_CODE = `${SELECT_SYSTEMS}
WHERE LOWER(sys.alias)=LOWER($1)`;

export const SELECT_SYSTEM_PACKAGES = `WITH RECURSIVE cte_tc_cat AS (
	SELECT	p.package_id, p.package_id AS parent_id, p.ea_guid
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='TechCapabilitiesCatalogue'
	UNION
	SELECT c.package_id, c.package_id, c.ea_guid
		FROM cte_tc_cat p
		JOIN t_package c ON c.parent_id=p.package_id
)
SELECT s.object_id, s.name, c.package_id, cp.package_id as containers_package_id, it.package_id as interfaces_package_id
FROM  t_object s 
	LEFT JOIN t_object o ON LOWER(o.alias)=LOWER($1) AND o.object_type='Package'
	LEFT JOIN cte_tc_cat c ON o.ea_guid=c.ea_guid 
	LEFT JOIN t_package cp ON cp.parent_id=c.package_id AND cp.name='${CONTAINERS_SUBPACKAGE_NAME}'
	LEFT JOIN t_package it ON it.parent_id=c.package_id AND it.name='${INTERFACES_SUBPACKAGE_NAME}'
WHERE LOWER(s.alias)=LOWER($1) AND s.stereotype='softwareSystem'`;