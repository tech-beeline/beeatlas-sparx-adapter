import { BC_PACKAGE_QUERY_BY_ID } from "../capabilities-repository/index.mjs";
import Repository, { t_object, t_package } from "../sparx-ea-repository/index.mjs";
import { SparxRepositoryPackagesOptions } from "../sparx-ea-repository/options.mjs";
import { BC_TC_REALIZATION_DIAGRAM } from "./const.mjs";

export const SELECT_PARENT_BC = `WITH RECURSIVE cte_bc_catalog AS (
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
		bc.object_id as bc_id,
		bc.name as bc_name,
		c.alias AS code,
		c.object_id as tc_id
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

export const SELECT_BC_FOR_TC = `${SELECT_PARENT_BC}
WHERE code=$2
`

export const SELECT_OR_CREATE_BC_REALIZATION_DIAGRAM =
	`WITH 
cte_bc AS (
	SELECT 
		coalesce(p.package_id,o.package_id) as package_id, 
		o.object_id,
		bcd.diagram_id
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
		LEFT JOIN t_diagram bcd ON bcd.package_id=p.package_id AND bcd.name=$2
	WHERE o.alias=$1
),
cte_new_diagram AS (
	INSERT INTO t_diagram (
		package_id,
		ea_guid,
		name,
		diagram_type,
		author
	) SELECT
		package_id,
		UPPER('{' || gen_random_uuid() || '}' ),
		$2,
		'Component',
		'FDM API'
	FROM cte_bc
		WHERE diagram_id is NULL
	RETURNING diagram_id, package_id
),
cte_bcd AS
(
	SELECT 
		cte_bc.object_id, 
		cte_bc.package_id, 
		coalesce( cte_bc.diagram_id,d.diagram_id) as diagram_id
	FROM cte_bc
		LEFT JOIN cte_new_diagram d ON d.package_id=cte_bc.package_id
)
SELECT * FROM cte_bcd`;

export const SELECT_DIAGRAMOBJECTS =
	`SELECT 
	dob.*,
	c.alias as code
FROM t_diagramobjects dob
	JOIN t_object c ON c.object_id=dob.object_id
WHERE dob.diagram_id=$1`;


export const DELETE_BC_TC_LINKS =
	`DELETE FROM t_diagramlinks
WHERE connectorid IN (
	SELECT c.connector_id
	FROM t_connector c
		JOIN t_object tc ON tc.alias=$1 AND tc.object_id=c.end_object_id
		JOIN t_object bc ON bc.alias = ANY($2) AND bc.object_id=c.start_object_id
	WHERE c.stereotype='ArchiMate_Aggregation')
`

export const DELETE_BC_TC_CONNECTOR =
	`DELETE FROM t_connector
WHERE connector_id IN (
	SELECT c.connector_id
	FROM t_connector c
		JOIN t_object tc ON tc.alias=$1 AND tc.object_id=c.end_object_id
		JOIN t_object bc ON bc.alias = ANY($2) AND bc.object_id=c.start_object_id
	WHERE c.stereotype='ArchiMate_Aggregation')
`;


/**
 * 
 * @param {t_object} bc 
 * @returns {Promise<{ object_id, package_id, diagram_id}}
 */
export async function prepareBcRealizationDiagram(bc) {
	if (bc.object_type === 'Package') { // BC является доменом
		const pkg = await Repository.first(t_package, { ea_guid: bc.ea_guid });
		return Repository.putDiagram({ package_id: pkg.package_id, name: BC_TC_REALIZATION_DIAGRAM, diagram_type: 'Component', author: 'FDM API' });
	}
	const bc_package = await Repository.queryOne(BC_PACKAGE_QUERY_BY_ID, [SparxRepositoryPackagesOptions.BusinessCapabilitiesCatalogue.ea_guid, bc.object_id]);
	if (!bc_package) throw Error(`Не найдена папка, где находится диграмма для BC ${bc.name}`);

	// [ ] ДОбавить обработку  отсутсвия диаграммы для BC
	return Repository.putDiagram({ package_id: bc_package.package_id, name: BC_TC_REALIZATION_DIAGRAM, diagram_type: 'Component', author: 'FDM API' });
}

