
const E2E_PACKAGE_UID = process.env.E2E_CATALOG_UID ?? '{F486A191-8D01-471b-AD9B-271B6AD388EB}';

export const CTE_E2E_CATALOG = `cte_e2e_catalog AS (
	SELECT 
		grp.name AS group_name, 
		grp.ea_guid AS group_uid, 
		base.name AS base_process, 
		base.ea_guid AS base_process_uid,
		key_process.name AS key_process, 
		key_process.ea_guid AS key_process_uid, 
		key_process.package_id
	FROM t_package grp 
	JOIN t_package base ON base.parent_id=grp.package_id
	JOIN t_package key_process ON key_process.parent_id=base.package_id
WHERE grp.parent_id = (SELECT package_id FROM t_package WHERE ea_guid='${E2E_PACKAGE_UID}'))`

export const CTE_E2E_PAKAGES = `cte_e2e_pkg AS  (
	SELECT 
		group_name, 
		group_uid, 
		base_process, 
		base_process_uid, 
		key_process, 
		key_process_uid, 
		key_process AS pkg_name, 
		package_id
	FROM cte_e2e_catalog
	UNION DISTINCT
	SELECT 
		group_name, 
		group_uid, 
		base_process, 
		base_process_uid, 
		key_process, 
		key_process_uid, 
		p.name, 
		p.package_id
	FROM cte_e2e_pkg
		JOIN t_package p ON p.parent_id=cte_e2e_pkg.package_id )`


export const SELECT_ALL_E2E = `WITH RECURSIVE
${CTE_E2E_CATALOG},
${CTE_E2E_PAKAGES}
SELECT group_name, 
		group_uid, 
		base_process, 
		base_process_uid, 
		key_process, 
		key_process_uid, 
		pkg_name as package_name, 
		sd.package_id,
        sd.name AS name, 
        sd.ea_guid as uid,
		sd.version
FROM cte_e2e_pkg
	JOIN t_diagram sd ON sd.package_id=cte_e2e_pkg.package_id AND sd.stereotype='e2e_diagram'`;

export const SELECT_E2E_BY_UID = `${SELECT_ALL_E2E} WHERE sd.ea_guid=$1`;

export const CTE_DIAGRAM_LINK = `cte_diagram_link AS
(
	SELECT 
		od.diagram_id, 
		o.object_id, 
		d.diagram_id AS child_diagram_id,
		d.ea_guid,
		d.name
	FROM t_xref x
		JOIN t_object o ON o.ea_guid=x.client
		JOIN t_diagram d ON d.ea_guid=x.supplier AND d.diagram_type='Sequence'
		JOIN t_diagramobjects od ON od.object_id=o.object_id AND od.diagram_id <> d.diagram_id
	WHERE x.name='DefaultDiagram'
)`;

export const CTE_DIAGRAMS = `${CTE_DIAGRAM_LINK},
cte_diagrams AS
(
	SELECT 
		diagram_id as e2e_id, 
		diagram_id as diagram_id, 
		ea_guid as e2e_uid,
		ea_guid,
		name
	FROM t_diagram WHERE diagram_type='Sequence'
	UNION DISTINCT
	SELECT
		d.e2e_id, 
		r.child_diagram_id, 
		d.e2e_uid,
		r.ea_guid,
		r.name
	FROM cte_diagram_link r
		JOIN cte_diagrams d on d.diagram_id=r.diagram_id 
)`

export const SELECT_BI_DIAGRAMS_ID = `WITH RECURSIVE
${CTE_DIAGRAMS}
SELECT diagram_id from cte_diagrams
WHERE cte_diagrams.e2e_uid=$1`;

export const SELECT_DIAGRAMS_MESSAGES = `SELECT 
d.ea_guid as diagram_uid, 
d.name as diagram, 
m.name, 
m.start_object_id as client_id, 
m.end_object_id as server_id, 
m.stereotype, 
m.ea_guid, 
m.notes,
op.value as operation_guid, 
rps.value as rps, 
l.value as latency, 
e.value as error_rate, 
m.seqno, 
m.pdata1 = 'Synchronous' as is_sync, 
m.pdata4 as is_ret, 
ia.value as ia_path
FROM t_diagram d
JOIN t_connector m ON m.diagramid=d.diagram_id
LEFT JOIN t_connectortag op ON op.elementid=m.connector_id AND op.property='operation_guid'
LEFT JOIN t_connectortag rps ON rps.elementid=m.connector_id AND rps.property='TPSThreshold'
LEFT JOIN t_connectortag l ON l.elementid=m.connector_id AND l.property='LatencyThreshold'
LEFT JOIN t_connectortag e  ON e.elementid=m.connector_id AND e.property='ErrorThreshold'
LEFT JOIN t_connectortag ia ON ia.elementid=m.connector_id AND ia.property='InterfaceAgreement'
WHERE d.diagram_id = ANY($1)`;

export const SELECT_DIAGRAMS_SYSTEMS = `SELECT 
	d.ea_guid AS d_uid,
	od.object_id, 
	p.object_id AS parent_id, 
	COALESCE( p.alias, o.alias) AS code, 
	COALESCE(p.name, o.name) AS name, 
	o.object_type
FROM t_diagram d
	JOIN t_diagramobjects od ON od.diagram_id=d.diagram_id
    JOIN t_object o ON o.object_id=od.object_id
    LEFT JOIN t_object p ON p.object_id=o.parentid AND o.object_type='ProvidedInterface'
WHERE d.diagram_id = ANY($1)`;


export const SELECT_SCENARIO_MESSAGES = `
WITH RECURSIVE
${CTE_DIAGRAMS}
SELECT 
	d.ea_guid as diagram_uid, 
	d.name as diagram, 
	m.name, 
	m.start_object_id as client_id, 
	m.end_object_id as server_id, 
	m.stereotype, 
	m.ea_guid, 
	m.notes,
	op.value as operation_guid,
	m.seqno, 
	m.pdata1 = 'Synchronous' as is_sync, 
	m.pdata4 as is_ret
FROM cte_diagrams d
	JOIN t_connector m ON m.diagramid=d.diagram_id
	LEFT JOIN t_connectortag op ON op.elementid=m.connector_id AND op.property='operation_guid'
WHERE d.e2e_uid=$1
`