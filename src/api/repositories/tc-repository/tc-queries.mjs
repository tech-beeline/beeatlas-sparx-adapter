import { NotFound, NotImplemented } from '../../../utils/errors.mjs';
import Repository, { t_object } from '../sparx-ea-repository/index.mjs'
import { TC_TAGS_NAMES, TECH_CAPABILITY_STEREOTYPE } from './const.mjs';

export const SELECT_ALL_TEC = `
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
		JOIN t_diagramobjects po ON po.diagram_id=d.diagram_id AND po.object_id=p.object_id
		JOIN t_connector c ON c.stereotype IN ('ArchiMate_Aggregation', 'ArchiMate_Composition')
			AND c.start_object_id=p.object_id
		JOIN t_object bc ON bc.object_id=c.end_object_id 
			AND bc.stereotype IN ('ArchiMate_Capability', 'ArchiMate_TechnicalCapability')
		JOIN t_diagramobjects co ON co.diagram_id=d.diagram_id AND co.object_id=bc.object_id
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
)
SELECT
	sys.code as sys_code, 
	tc.code, 
	tc.parent_code,
	tc.name,
	tc.status,
	tc.author,
	tc.version,
	goal_to.value as goal_to,
	goal_from.value as goal_from,
	(SELECT obe.name 
	 		FROM t_connector co,  t_object obe 
	 		WHERE co.end_object_id = tc.object_id
	 		AND obe.object_id = co.start_object_id
	 		AND co.stereotype = 'Responsibility'
	 		AND obe.stereotype = 'ArchiMate_BusinessActor' limit 1) as owner
FROM cte_tbc tc
	JOIN cte_sys_package sys ON sys.package_id=tc.cap_package_id
	LEFT JOIN t_objectproperties goal_to ON goal_to.object_id=tc.object_id AND goal_to.property='goal_to'
	LEFT JOIN t_objectproperties goal_from ON goal_from.object_id=tc.object_id AND goal_from.property='goal_from'
WHERE type='ArchiMate_TechnicalCapability'`;

export const SELECT_TC_BY_CODE = `${SELECT_ALL_TEC}
	AND tc.code=$1
`
export const insertTC = async (tc) => {
	const tc_pacakge = await Repository.find
	NotImplemented();
}