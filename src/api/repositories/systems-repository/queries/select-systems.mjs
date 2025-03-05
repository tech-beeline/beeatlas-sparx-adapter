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