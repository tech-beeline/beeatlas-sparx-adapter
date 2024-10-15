import { NotFound, NotImplemented } from '../../../utils/errors.mjs';
import Repository, { t_object } from '../sparx-ea-repository/index.mjs'
import { TC_TAGS_NAMES, TECH_CAPABILITY_STEREOTYPE } from './const.mjs';

export const SELECT_ALL_TEC = `WITH RECURSIVE 
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

export const SELECT_TC_BY_CODE = `${SELECT_ALL_TEC}
	AND tc.alias=$2
`

export const insertTC = async (tc) => {
	const tc_pacakge = await Repository.find
	NotImplemented();
}