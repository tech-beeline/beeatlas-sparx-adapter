export const SELECT_DOMAINS = `WITH RECURSIVE cte_domains AS 
(
 SELECT p.package_id,
	o.object_id,
	o.alias AS code,
	NULL::text AS parent_code,
	o.name,
	o.note as description,
	o.author,
	o.status,
	o.createddate as "createdDate",
	o.modifieddate
   FROM t_object o
	 JOIN t_package p ON p.ea_guid= o.ea_guid
  WHERE o.stereotype = 'BusinessCapabilitiesCatalogue'
UNION
 SELECT p.package_id,
	o.object_id,
	o.alias,
	parent.code,
	o.name,
	o.note as description,
	o.author,
	o.status,
	o.createddate,
	o.modifieddate
   FROM cte_domains parent
	 JOIN t_package p ON p.parent_id = parent.package_id
	 JOIN t_object o ON o.ea_guid = p.ea_guid
), cte_owners AS (
         SELECT obe.name,
            co.end_object_id AS object_id
           FROM t_connector co,
            t_object obe
          WHERE obe.object_id = co.start_object_id AND co.stereotype::text = 'Responsibility'::text AND obe.stereotype::text = 'ArchiMate_BusinessActor'::text
          GROUP BY obe.name, co.end_object_id
        )
SELECT 
	dmn.*, true as "isDomain",
    dmn.parent_code as parent,
	o.name as owner
FROM cte_domains dmn 
	LEFT JOIN cte_owners o ON o.object_id=dmn.object_id`;