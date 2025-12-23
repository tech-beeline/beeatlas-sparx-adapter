import { NotImplemented } from "../../../../utils/errors.mjs";
import eaRepository from "../../sparx-ea-repository/ea-repository.mjs";

const DELETE_REMOVED_OBJECTS = `
`;

const SELECT_LINKS = `
SELECT
	c.start_object_id, c.end_object_id, l.instance_id
FROM t_diagramlinks l
	JOIN t_connector c ON c.connector_id=l.connectorid
WHERE l.diagramid=$1`;

const SELECT_OBJECTS = `
`

export const deleteRemoveOjbects = (diagramId, actualIdList) => {
    return eaRepository.query(`DELETE FROM t_diagramobjects WHEERE diagram_id=$1 AND NOT (object_id = ANY($2))`,
        diagramId,
        actualIdList);
}

/**
 * 
 * @param {number} diagramId 
 * @param {{object_id, left,right, top, bottom}[]} objects 
 */
export const insertNewOjbects = async (diagramId, objects) => {
    const r = await eaRepository.query('SELECT * FROM json_to_recordset($1::json) AS (object_id int, "left" int, "right" int, "top" int, "bottom" int)', JSON.stringify(objects));
    NotImplemented();
}

export const updateNewOjbects = async (diagramId, actualIdList) => {
    NotImplemented();
}

/**
 * 
 * @param {number} diagramId 
 * @returns {Promise<{start_object_id, end_object_id, instance_id}[]>}
 */
export const selectLinks = (diagramId) => eaRepository.query(SELECT_LINKS, diagramId);
/**
 * 
 * @param {number} diagramId 
 * @returns {Promise<{object_id, recttop, rectleft, rectright, rectbottom}[]>}
 */
export const selectObjects = (diagramId) => eaRepository.query(`SELECT * FROM t_diagramobjects WHERE diagram_id=$1`, diagramId);