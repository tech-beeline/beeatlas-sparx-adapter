import Repository from '../sparx-ea-repository/index.mjs'

import { APP_PACKAGE_ROOT_GUID, BC_PACKAGE_ROOT_GUID } from '../sparx-ea-repository/options.mjs';

const SELECT_ALL_TEC = `WITH RECURSIVE 
cte_app_catalog AS (
	SELECT 
		p.package_id, 
		p.package_id AS parent_id, 
		p.name, 
		o.alias as code
	FROM t_package p
		JOIN t_object o ON o.ea_guid= p.ea_guid
	WHERE p.ea_guid=$1
	UNION DISTINCT
	SELECT 
		c.package_id, 
		p.parent_id, 
		c.name, 
		coalesce( o.alias, p.code)
	FROM cte_app_catalog p
		JOIN t_package c ON c.parent_id=p.package_id
		JOIN t_object o ON c.ea_guid=o.ea_guid
)
SELECT 
	app.code as sys_code,
	sys.name as sys_name,
	tc.alias AS code,
	tc.object_id,
	tc.name,
	tc.note AS description,
	tc.author,
	tc.status,
	tc.version,
	tc.createdDate as "createdDate",
	tc.modifiedDate as "modifiedDate",
	goal_to.value AS goal_to,
	goal_from.value AS goal_from
FROM t_object tc
	JOIN cte_app_catalog app ON app.package_id= tc.package_id
	JOIN t_object sys ON sys.alias=app.code AND sys.object_type='Component'
	LEFT JOIN t_objectproperties goal_to ON goal_to.object_id=tc.object_id AND goal_to.property='goal_to'
	LEFT JOIN t_objectproperties goal_from ON goal_from.object_id=tc.object_id AND goal_from.property='goal_from'
WHERE tc.stereotype='ArchiMate_TechnicalCapability'`;

const SELECT_TC_DATA = `${SELECT_ALL_TEC}
	AND tc.alias=$2
`

const SELECT_PARENT_BC = `WITH RECURSIVE cte_bc_catalog AS (
	SELECT 
		p.package_id, 
		p.package_id AS parent_id, 
		p.name, o.aliAS
	FROM t_package p
		JOIN t_object o ON o.ea_guid = p.ea_guid
	WHERE p.ea_guid=$1
	UNION DISTINCT
	SELECT 
		c.package_id, 
		p.parent_id, 
		c.name, 
		coalesce( o.aliAS, p.aliAS)
	FROM cte_bc_catalog p
		JOIN t_package c ON c.parent_id=p.package_id
		JOIN t_object o ON c.ea_guid=o.ea_guid
),
cte_btc AS 
(
	SELECT DISTINCT
		bc.alias AS bc_code, 
		bc.name as bc_name,
		c.alias AS code
	FROM cte_bc_catalog cat
		JOIN t_diagram d ON d.package_id=cat.package_id
		JOIN t_diagramobjects oo ON oo.diagram_id=d.diagram_id
		JOIN t_object c ON c.object_id=oo.object_id AND c.stereotype ='ArchiMate_TechnicalCapability'
		JOIN t_connector r ON r.end_object_id=c.object_id
		JOIN t_object bc ON bc.object_id= r.start_object_id AND (bc.stereotype='ArchiMate_Capability' OR bc.object_type='Package')  AND bc.aliAS is not null
		JOIN t_diagramobjects obc ON obc.diagram_id=d.diagram_id AND obc.object_id=bc.object_id
)
SELECT 
	bc_code,
	bc_name,
	code as tc_code
FROM cte_btc`;

const SELECT_BC_FOR_TC = `${SELECT_PARENT_BC}
WHERE code=$2
`

export class TechnicalCapabilitiesRepository {
	/**
	 * 
	 * @returns {Promise<Array<{ sys_code, sys_name, code, name, author, description, status, version, object_id, createddate, modifieddate, goal_from, goal_to}>>}
	 */
	async selectTCList() {
		return Repository.queryRows(SELECT_ALL_TEC, [APP_PACKAGE_ROOT_GUID])
	}

	/**
	 * 
	 * @returns {Promise<Array<{ sys_code, sys_name, code, name, author, description, status, version, object_id, createddate, modifieddate, goal_from, goal_to}>>}
	 */
	async selectTCData(tcCode) {
		return Repository.queryOne(SELECT_TC_DATA, [APP_PACKAGE_ROOT_GUID, tcCode])
	}

	/**
	 * 
	 * @returns {Promise<Array<{ sys_code, sys_name, code, name, author, description, status, version, object_id, createddate, modifieddate, goal_from, goal_to}>>}
	 */
	async selectParentBC() {
		return Repository.queryRows(SELECT_PARENT_BC, [BC_PACKAGE_ROOT_GUID]);
	}

	/**
	 * 
	 * @returns {Promise<Array<{ sys_code, sys_name, code, name, author, description, status, version, object_id, createddate, modifieddate, goal_from, goal_to}>>}
	 */
	async selectParentBCForTC(tcCode) {
		return Repository.queryRows(SELECT_BC_FOR_TC, [BC_PACKAGE_ROOT_GUID, tcCode]);
	}
}