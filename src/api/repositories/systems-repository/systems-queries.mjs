import { APP_CATALOG_ROOT } from "../../../resources/const.mjs";

export const SELECT_SYSTEM_SUBPACKAGES = `
SELECT
    name, package_id
FROM t_package
WHERE parent_id=$1
  AND name = ANY($2)`;

export const SELECT_SYSTEM_PARTICIPITION = `WITH RECURSIVE
cte_sys_catalog AS (
SELECT p.package_id, p.package_id AS parent_id, p.name
  FROM t_object o
	LEFT JOIN t_package p ON p.ea_guid=o.ea_guid
  WHERE o.stereotype='ApplicationCatalogue'
UNION DISTINCT
SELECT c.package_id, p.parent_id, c.name
  FROM cte_sys_catalog p
  JOIN t_package c ON c.parent_id=p.package_id
),
cte_sys AS (
SELECT sys.name, sys.ea_guid, sys.alias as code, sys.object_id as sys_id
FROM cte_sys_catalog cat
  JOIN t_object sys ON sys.package_id=cat.package_id AND LOWER(sys.alias) = LOWER($1) AND sys.object_type='Component'
),
cte_realization AS ( 
SELECT DISTINCT r.start_object_id, c.*
  FROM t_connector r 
	  JOIN t_object c ON  c.object_id=r.end_object_id
  WHERE r.connector_type='Realisation'),
cte_sys_obj AS (
  SELECT  sys.name as sys_name, sys.name, sys.code AS sys_code, sys.ea_guid, sys.code, sys.sys_id, sys.sys_id as object_id
  FROM cte_sys sys
  UNION -- Provided interfaces
  SELECT sys.name, it.name, sys.code, it.ea_guid, it.alias, sys.sys_id, it.object_id
  FROM cte_sys sys
	  JOIN t_object it ON it.parentid=sys.sys_id AND it.object_type='ProvidedInterface'
  UNION DISTINCT -- containers from structurizr
  SELECT sys.name, c.name, sys.code, c.ea_guid, c.alias, sys.sys_id, c.object_id
  FROM cte_sys sys
	  JOIN cte_realization c ON c.start_object_id=sys.sys_id AND c.stereotype='C4_Container'
  UNION DISTINCT -- interfaces from structurizr
  SELECT sys.name, it.name, sys.code, it.ea_guid, it.alias, sys.sys_id, it.object_id
  FROM cte_sys sys
	  JOIN cte_realization c ON c.start_object_id=sys.sys_id AND c.stereotype='C4_Container'
	  JOIN cte_realization it ON it.start_object_id=c.object_id AND it.object_type='Interface'
),
cte_bi AS (
SELECT e2e.name as process, e2e.ea_guid as process_uid, bi.name as bi_name, d.ea_guid as bi_uid, d.diagram_id as bi_id
FROM t_diagram e2e
  JOIN t_diagramobjects bi_do ON bi_do.diagram_id=e2e.diagram_id
  JOIN t_object bi ON bi.object_id=bi_do.object_id AND bi.object_type='InteractionOccurrence'
  JOIN t_diagram d ON d.diagram_id=bi.pdata1::integer
WHERE e2e.stereotype='e2e_diagram'
),
cte_dia_ref AS (
SELECT od.diagram_id, d.name , d.ea_guid, d.diagram_id AS child_id
FROM t_xref x
  JOIN t_object o ON o.ea_guid=x.client
  JOIN t_diagram d ON d.ea_guid=x.supplier AND d.diagram_type='Sequence'
  JOIN t_diagramobjects od ON od.object_id=o.object_id AND od.diagram_id <> d.diagram_id
where x.name='DefaultDiagram'
),
cte_bi_dia AS (
SELECT 
	bi.process, 
	bi.process_uid, 
	bi.bi_name, 
	bi.bi_uid,
	bi.bi_id,
	bi.bi_id as diagram_id, 
	bi.bi_uid as diagram_uid, 
	bi.bi_name as diagram, 
	bi.bi_id as parent_id
FROM cte_bi bi
UNION DISTINCT
SELECT bi.process, bi.process_uid, bi.bi_name, bi.bi_uid, bi.bi_id, ref.child_id,  ref.ea_guid, ref.name, bi.diagram_id
FROM cte_bi_dia bi
  JOIN cte_dia_ref ref ON ref.diagram_id=bi.diagram_id
), cte_sys_msg AS (
  SELECT 
	  o.sys_code, o.sys_name, o.name as component,
	  msg.seqno, msg.name as message, mtd.name as operation, it.name as interface, it.ea_guid as interface_uid, op.value as operation_guid,
	  d.*
  FROM cte_bi_dia d
	  JOIN t_connector msg ON msg.diagramid=d.diagram_id  AND msg.connector_type='Sequence'
	  JOIN cte_sys_obj o ON o.object_id=msg.end_object_id
	  LEFT JOIN t_connectortag op ON op.elementid=msg.connector_id AND op.property='operation_guid'
	  LEFT JOIN t_operation mtd ON mtd.ea_guid=op.value
	  LEFT JOIN t_object it ON it.object_id=mtd.object_id
)
SELECT *
FROM cte_sys_msg`

export const SELECT_SYSTEM_CAPABILITIES = `
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
		o.note as description
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='BusinessCapabilitiesCatalogue'
	UNION
	SELECT 
		p.package_id, p.name, o.alias, parent.code, o.object_id,
		o.author,
		o.status,
		o.version,
		o.note as description
	FROM cte_bc_pkg parent
		JOIN t_package p ON p.parent_id=parent.package_Id
		JOIN t_object o ON o.ea_guid=p.ea_guid	
), cte_tbc AS (
	SELECT 
		package_id, name, code, code as domain_code, parent_code, object_id, 'Domain' as type,
		package_id as cap_package_id,
		author,
		version,
		status
	FROM cte_bc_pkg WHERE code IS NOT NULL
	UNION
	SELECT 
		p.package_id, 
		bc.name, 
		bc.alias, 
		p.domain_code, 
		p.code, 
		bc.object_id, 
		bc.stereotype::text,
		bc.package_id,
		bc.author,
		bc.version,
		bc.status
	FROM cte_tbc p
		JOIN t_diagram d ON d.package_id=p.package_id
		JOIN t_diagramlinks l ON l.diagramid=d.diagram_id
		JOIN t_connector c ON c.connector_id=l.connectorid 
			AND c.stereotype IN ('ArchiMate_Aggregation', 'ArchiMate_Composition')
			AND c.start_object_id=p.object_id
		JOIN t_object bc ON bc.object_id=c.end_object_id 
			AND bc.stereotype IN ('ArchiMate_Capability', 'ArchiMate_TechnicalCapability')
), cte_sys_package AS (
	SELECT 
		p.package_id, p.name, o.alias as code
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='TechCapabilitiesCatalogue'
	UNION
	SELECT 
		p.package_id, p.name, coalesce( o.alias, parent.code)
	FROM cte_sys_package parent
		JOIN t_package p ON p.parent_id=parent.package_Id
		JOIN t_object o ON o.ea_guid=p.ea_guid	
), cte_tree AS (
	SELECT
		sys.code as sys_code, 
		tc.code, 
		tc.parent_code,
		tc.name,
		type
	FROM cte_tbc tc
		JOIN cte_sys_package sys ON sys.package_id=tc.cap_package_id AND sys.code IS NOT NULL
	WHERE type='ArchiMate_TechnicalCapability'
	UNION DISTINCT
	SELECT 
		ch.sys_code,
		tc.code,
		tc.parent_code,
		tc.name,
		tc.type
	FROM cte_tree ch
		JOIN cte_tbc tc ON tc.code=ch.parent_code
)
SELECT * 
FROM cte_tree
WHERE LOWER(sys_code)=LOWER($1)
`;


export const SELECT_PROVIDED_API = `WITH RECURSIVE cte_src AS (
	SELECT
		t.object_id as target_id,
		src.value AS api_metric_template
	FROM t_object t 
		JOIN t_objectproperties src ON src.object_id=t.object_id and src.property='api-metric-template'
)
SELECT 
		api.name,
		api.alias as api_code,
		api.ea_guid,
		api.object_id,
		m.name as method_name,
		m.ea_guid as method_uid,
		m.notes as method_description,
		rps.value as rps,
		latency.value as latency,
		error_rate.value as error_rate
	FROM t_object app
		JOIN t_object pi ON pi.parentid=app.object_id
		JOIN t_object api ON api.object_id=pi.classifier
		JOIN t_operation m ON m.object_id=api.object_id
		LEFT JOIN t_operationtag rps ON rps.elementid=m.operationid AND rps.property='rps'
		LEFT JOIN t_operationtag latency ON latency.elementid=m.operationid AND latency.property='latency'
		LEFT JOIN t_operationtag error_rate ON error_rate.elementid=m.operationid AND error_rate.property='error_rate'
WHERE LOWER(app.alias)=LOWER($1)
	AND app.stereotype='softwareSystem'`