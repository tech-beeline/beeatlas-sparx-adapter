import { CTE_BC, CTE_DOMAINS } from "./cte.mjs";

export const BC_PACKAGE_QUERY = `with recursive bc_catalog as (
	select p.package_id, p.package_id as parent_id, p.name, o.alias
		from t_package p
		join t_object o on o.ea_guid= p.ea_guid
	where p.ea_guid=$1
	union distinct
	select c.package_id, p.parent_id, c.name, coalesce( o.alias, p.alias)
		from bc_catalog p
		join t_package c on c.parent_id=p.package_id
		join t_object o on c.ea_guid=o.ea_guid
), btc as 
(
	select distinct  c.alias, c.stereotype, c.ea_guid, c.author, c.status, c.name, c.modifieddate, cat.alias as p_code, c.object_id
	from bc_catalog cat
		join t_diagram d on d.package_id=cat.package_id
		join t_diagramobjects oo on oo.diagram_id=d.diagram_id
		join t_object c on c.object_id=oo.object_id and c.stereotype in ('ArchiMate_Capability', 'ArchiMate_TechnicalCapability')
)
select p.name, pp.package_id as package_id, btc.* from btc
join t_object p on p.alias=btc.p_code and p.object_type='Package'
join t_package pp on pp.ea_guid=p.ea_guid`

export const BC_PACKAGE_QUERY_BY_ID = `${BC_PACKAGE_QUERY} where btc.object_id=$2`;

export const SELECT_ALL_BC =
`-- Список BC

WITH RECURSIVE cte_bc_pkg AS (
	SELECT 
		p.package_id, 
		p.name, 
		o.alias as code, 
		NULL::text as parent_code, 
		o.object_id,
		o.author,
		o.status,
		o.version,
		o.createddate,
		o.modifieddate,
		o.note as description,
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
		p.package_id, p.name, o.alias, parent.code, o.object_id,
		o.author,
		o.status,
		o.version,
		o.createddate,
		o.modifieddate,
		o.note,
		coalesce((SELECT obe.name 
	 		FROM t_connector co,  t_object obe 
	 		WHERE co.end_object_id = o.object_id
	 		AND obe.object_id = co.start_object_id
	 		--AND co.stereotype = 'Responsibility'
	 		AND obe.stereotype = 'ArchiMate_BusinessActor' limit 1),parent.owner )
	FROM cte_bc_pkg parent
		JOIN t_package p ON p.parent_id=parent.package_Id
		JOIN t_object o ON o.ea_guid=p.ea_guid	
), cte_tbc AS (
	SELECT 
		package_id, 
		name, 
		code, 
		true as "isDomain",
		code as domain_code, 
		parent_code, 
		object_id, 
		'Domain' as type,
		package_id as cap_package_id,
		author,
		version,
		status,
		createddate,
		modifieddate,
		description,
		owner
	FROM cte_bc_pkg WHERE code IS NOT NULL
	UNION
	SELECT 
		p.package_id, 
		bc.name, 
		bc.alias, 
		false,
		p.domain_code, 
		p.code, 
		bc.object_id, 
		bc.stereotype::text,
		bc.package_id,
		bc.author,
		bc.version,
		bc.status,
		bc.createddate,
		bc.modifieddate,
		bc.note,
		coalesce((SELECT obe.name 
	 		FROM t_connector co,  t_object obe 
	 		WHERE co.end_object_id = bc.object_id
	 		AND obe.object_id = co.start_object_id
	 		--AND co.stereotype = 'Responsibility'
	 		AND obe.stereotype = 'ArchiMate_BusinessActor' limit 1), p.owner )
	FROM cte_tbc p
		JOIN t_diagram d ON d.package_id=p.package_id
		JOIN t_diagramobjects po ON po.diagram_id=d.diagram_id AND po.object_id=p.object_id
		JOIN t_connector c ON c.stereotype IN ('ArchiMate_Aggregation', 'ArchiMate_Composition')
			AND c.start_object_id=p.object_id
		JOIN t_object bc ON bc.object_id=c.end_object_id 
			AND bc.stereotype IN ('ArchiMate_Capability', 'ArchiMate_TechnicalCapability')
		JOIN t_diagramobjects co ON co.diagram_id=d.diagram_id AND co.object_id=bc.object_id
)
SELECT
DISTINCT
	bc.code, 
	bc.name,
	bc."isDomain",
	bc.description,
	bc.createddate AS "createdDate",
	--bc.modifieddate AS "modifiedDate",
	bc.parent_code as parent,
	bc.status,
	bc.author,
	bc.version,
	bc.owner
FROM cte_tbc bc
WHERE bc.type IN ('ArchiMate_Capability', 'Domain')`;

export const SELECT_BC_DOMAIN = `WITH RECURSIVE
${CTE_BC}
SELECT 
	d.* 
FROM cte_bc b
	JOIN cte_bc d ON d.package_id=b.package_id
WHERE lower(b.code)=lower($1)`;

export const SELECT_DOMAINS_DIAGRAMS = `WITH RECURSIVE
${CTE_DOMAINS}
SELECT 
	d.diagram_id, d.name, dmn.code
FROM cte_domains dmn
	JOIN t_diagram d ON d.package_id=dmn.package_id AND d.name='[AUTO] ' || dmn.name`;

export const SELECT_DOMAIN_DIAGRAM_BY_CODE = `${SELECT_DOMAINS_DIAGRAMS} WHERE dmn.code=$1`;
export const SELECT_DOMAIN_DIAGRAM_BY_PACKAGE_ID = `${SELECT_DOMAINS_DIAGRAMS} WHERE dmn.package_id=$1`;

export const INSERT_DOMAIN_DIAGRAM = `INSERT INTO t_diagram(
	package_id,
	diagram_type,
	ea_guid,
	name,
	version,
	author,
	attpub, 
	attpri, 
	attpro, 
	orientation, 
	cx, 
	cy, 
	scale,
	showforeign, 
	showborder, 
	showpackagecontents
) 
SELECT
	package_id,
	'Component',
	UPPER('{' || gen_random_uuid() || '}'),
	'[AUTO] ' || name,
	'1.0',
	'FDM API',
	1,
	1,
	1,
	'P',
	795,
	1138,
	100,
	1,
	1,
	1
FROM t_package WHERE package_id=$1
RETURNING diagram_id`;

export const SELECT_DIAGRAM_HIERARCHY = `WITH RECURSIVE cte_domain AS (
	SELECT
		o.name, o.alias as code, NULL::text as parent_code, ob.*, 0 as parent
	FROM t_diagram d
		JOIN t_package dm ON dm.package_id=d.package_id
		JOIN t_object o ON o.ea_guid=dm.ea_guid
		JOIN t_diagramobjects ob ON o.object_id=ob.object_id AND ob.diagram_id=d.diagram_id
	WHERE d.diagram_id=$1
	UNION
	SELECT
		o.name, o.alias as code, dm.code, ob.*, dm.object_id
	FROM cte_domain dm
		JOIN t_diagramlinks l ON l.diagramid=dm.diagram_id
		JOIN t_connector c ON c.connector_id=l.connectorid 
			AND c.connector_type='Association' 
			AND c.stereotype='ArchiMate_Aggregation' 
			AND c.start_object_id=dm.object_id
		JOIN t_object o ON o.object_id=c.end_object_id
		JOIN t_diagramobjects ob ON ob.object_id=o.object_id AND ob.diagram_id=dm.diagram_id
)
SELECT * FROM cte_domain
`;

export const INSERT_DIAGRAM_OBJECTS = `
INSERT INTO t_diagramobjects(
	diagram_id,
	object_id,
	rectleft,
	rectright,
	recttop,
	rectbottom,
	sequence
)
VALUES(
	$1,
	$2,
	$3,$4,$5,$6,0
)
`;

export const INSERT_DIAGRAM_LINK = `
INSERT INTO t_diagramlinks(
	diagramid,
	connectorid,
	hidden
)
VALUES(
	$1,
	$2,
	0
)
`