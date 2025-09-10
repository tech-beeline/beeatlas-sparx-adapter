import { NotImplemented } from "../../../../utils/errors.mjs";
import eaRepository from "../../sparx-ea-repository/ea-repository.mjs";

/**
 * 
 * @returns {Promise<{object_id, name}[]>}
 */
export const selectOwners = () => eaRepository.query(
    `
SELECT DISTINCT obe.name,
	co.end_object_id AS object_id
FROM t_connector co, t_object obe
WHERE obe.object_id = co.start_object_id AND co.stereotype = 'Responsibility' AND obe.stereotype = 'ArchiMate_BusinessActor'
GROUP BY obe.name, co.end_object_id`);