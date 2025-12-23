import { NotImplemented } from "../../../../utils/errors.mjs";
import eaRepository from "../../sparx-ea-repository/ea-repository.mjs";

export const SELECT_BC = `
WITH RECURSIVE cte_domains AS 
(
	SELECT p.package_id,
		o.object_id,
		o.alias AS code,
		NULL::text AS parent_code,
		d.diagram_id
   	FROM t_object o
		JOIN t_package p ON p.ea_guid= o.ea_guid
		LEFT JOIN t_diagram d ON d.package_id=p.package_id
  	WHERE o.stereotype = 'BusinessCapabilitiesCatalogue'
 	UNION
 	SELECT p.package_id,
		o.object_id,
		o.alias,
		parent.code,
		d.diagram_id
   	FROM cte_domains parent
		JOIN t_package p ON p.parent_id = parent.package_id
	 	JOIN t_object o ON o.ea_guid = p.ea_guid
		LEFT JOIN t_diagram d ON d.package_id=p.package_id
), cte_owners AS (
	SELECT obe.name,
		co.end_object_id AS object_id
	FROM t_connector co,
		t_object obe
	WHERE obe.object_id = co.start_object_id AND co.stereotype::text = 'Responsibility'::text AND obe.stereotype::text = 'ArchiMate_BusinessActor'::text
	GROUP BY obe.name, co.end_object_id
), cte_all_bc AS (
	SELECT DISTINCT
		od.object_id,
		o.alias as code,
		p.alias as parent_code,
		dmn.code as domain_code,
		o.name,
		o.note as description,
		o.author,
		o.status,
		o.createddate as "createdDate",
		o.modifieddate
	FROM cte_domains dmn
		JOIN t_diagramobjects od ON od.diagram_id=dmn.diagram_id
		JOIN t_object o ON o.object_id=od.object_id AND o.stereotype = 'ArchiMate_Capability'
		JOIN t_connector c ON c.end_object_id=o.object_id AND c.stereotype IN ('ArchiMate_Aggregation', 'ArchiMate_Composition')
		JOIN t_object p ON p.object_id=c.start_object_id
		JOIN t_diagramobjects op ON op.object_id=p.object_id AND op.diagram_id=dmn.diagram_id
)
SELECT 
	bc.*, false as "isDomain",
	o.name as owner
FROM cte_all_bc bc
	LEFT JOIN cte_owners o ON o.object_id=bc.object_id`;
class BC_DTO {
	package_id; object_id; code; parent_code; name; description; author; status; createdDate; domain_code;
}
/**
 * 
 * @returns {Promise<BC_DTO[]>}
 */
export const selectBC = () => eaRepository.query(SELECT_BC);