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

export const BC_PACKAGE_QUERY_BY_ID = `${BC_PACKAGE_QUERY} where btc.object_id=$2`
export const SELECT_ALL_BC =
`WITH RECURSIVE cte_domains AS 
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
		o.object_id
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
		o.object_id
	FROM cte_domains d
		JOIN t_package p ON p.parent_id=d.package_id
		JOIN t_object o ON o.ea_guid=p.ea_guid AND (o.alias LIKE 'DMN%' OR o.alias LIKE 'GRP%')
), cte_bc AS 
(
	SELECT 
		d.name,
		true as "isDomain",
		d.code,
		d.author,
		d.createddate,
		d.status,
		d.parent_code as parent,
		d.description,
		d.package_id,
		d.object_id
	FROM cte_domains d
	UNION 
	SELECT
		bc.name,
		false as "isDomain",
		bc.alias,
		bc.author,
		bc.createddate,
		bc.status,
		d.code,
		bc.note,
		d.package_id,
		bc.object_id
	FROM cte_bc d
		JOIN t_diagram dd ON dd.package_id=d.package_id
		JOIN t_diagramlinks l ON l.diagramid=dd.diagram_id
		JOIN t_connector c ON c.connector_id=l.connectorid AND c.start_object_id=d.object_id
		JOIN t_object bc ON bc.object_id=c.end_object_id
)
SELECT * FROM cte_bc`;