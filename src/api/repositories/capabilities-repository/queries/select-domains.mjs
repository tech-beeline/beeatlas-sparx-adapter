import { NotImplemented } from "../../../../utils/errors.mjs";
import eaRepository from "../../sparx-ea-repository/ea-repository.mjs";

export const SELECT_DOMAINS = `WITH RECURSIVE cte_domains AS 
(
 SELECT p.package_id,
	o.object_id,
	o.alias AS code,
	NULL::text AS parent_code,
	o.name,
	o.note as description,
	o.author,
	o.status,
	o.createddate as "createdDate",
	o.modifieddate,
	d.diagram_id,
	d.name as diagram
   FROM t_object o
	 JOIN t_package p ON p.ea_guid= o.ea_guid
	 LEFT JOIN t_diagram d ON d.package_id=p.package_id
  WHERE o.stereotype = 'BusinessCapabilitiesCatalogue'
UNION
 SELECT p.package_id,
	o.object_id,
	COALESCE(o.alias, parent.code),
	parent.code,
	o.name,
	o.note as description,
	o.author,
	o.status,
	o.createddate,
	o.modifieddate,
	d.diagram_id,
	d.name as diagram
   FROM cte_domains parent
	 JOIN t_package p ON p.parent_id = parent.package_id
	 JOIN t_object o ON o.ea_guid = p.ea_guid
	 LEFT JOIN t_diagram d ON d.package_id=p.package_id
)
SELECT 
	dmn.*, true as "isDomain",
    dmn.parent_code as parent
FROM cte_domains dmn`;

class DomainRow {
	package_id; object_id; code; parent_code; name; description; author; status; createdDate; diagram_id; diagram
}
/**
 * 
 * @returns {Promise<DomainRow[]>}
 */
export const selectDomains = () => eaRepository.query(SELECT_DOMAINS);
