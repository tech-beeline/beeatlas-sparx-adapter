export const CTE_DOMAINS = `cte_domains AS 
(
	SELECT
		p.name,
		o.alias AS code,
		o.author,
		o.createddate,
		o.status,
		p.notes AS description,
		p.package_id,
		0 AS parent_id,
		NULL::text AS parent_code,
		o.object_id,
		(SELECT obe.name 
	 		FROM t_connector co,  t_object obe 
	 		WHERE co.end_object_id = o.object_id
	 		AND obe.object_id = co.start_object_id
	 		AND co.stereotype = 'Responsibility'
	 		AND obe.stereotype = 'ArchiMate_BusinessActor' limit 1) as owner
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='BusinessCapabilitiesCatalogue'
	UNION
	SELECT
		p.name,
		o.alias,
		o.author,
		o.createddate,
		o.status,
		p.notes,
		p.package_id,
		p.parent_id,
		d.code,
		o.object_id,
		coalesce((SELECT obe.name 
	 		FROM t_connector co,  t_object obe 
	 		WHERE co.end_object_id = o.object_id
	 		AND obe.object_id = co.start_object_id
	 		AND co.stereotype = 'Responsibility'
	 		AND obe.stereotype = 'ArchiMate_BusinessActor' limit 1),  d.owner)
	FROM cte_domains d
		JOIN t_package p ON p.parent_id=d.package_id
		JOIN t_object o ON o.ea_guid=p.ea_guid AND (o.alias LIKE 'DMN%' OR o.alias LIKE 'GRP%')
)`;

export const CTE_BC = `
${CTE_DOMAINS}, 
cte_bc AS (
	SELECT 
		d.name,
		true as "isDomain",
		d.code,
		d.author,
		d.createddate,
		d.status,
		d.parent_code as parent,
		d.code as domain,
		d.description,
		d.package_id,
		d.object_id,
		d.owner,
		0 as connector_id
	FROM cte_domains d
	UNION DISTINCT
	SELECT
		bc.name,
		false as "isDomain",
		bc.alias,
		bc.author,
		bc.createddate,
		bc.status,
		d.code,
		d.domain,
		bc.note,
		d.package_id,
		bc.object_id,
		coalesce((SELECT obe.name 
	 		FROM t_connector co,  t_object obe 
	 		WHERE co.end_object_id = bc.object_id
	 		AND obe.object_id = co.start_object_id
	 		AND co.stereotype = 'Responsibility'
	 		AND obe.stereotype = 'ArchiMate_BusinessActor' limit 1),  d.owner),
		c.connector_id
	FROM cte_bc d
		JOIN t_diagram dd ON dd.package_id=d.package_id
		JOIN t_diagramlinks l ON l.diagramid=dd.diagram_id
		JOIN t_connector c ON c.connector_id=l.connectorid AND c.start_object_id=d.object_id
		JOIN t_object bc ON bc.object_id=c.end_object_id AND bc.stereotype='ArchiMate_Capability'
)
`