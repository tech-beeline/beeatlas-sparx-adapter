import eaRepository from "../../sparx-ea-repository/ea-repository.mjs";
import { t_object } from "../../sparx-ea-repository/index.mjs";

const MERGE_CLASSIIFIERS =
    `UPDATE t_object
SET classifier=$1, classifier_guid=$2 
WHERE classifier=$3 OR classifier_guid=$4`;

const MERGE_CONNECTORS_START =
    `UPDATE t_connector
SET start_object_id=$1
WHERE start_object_id=$2
`;

const MERGE_CONNECTORS_END =
    `UPDATE t_connector
SET end_object_id=$1
WHERE end_object_id=$2`;

const MERGE_DIAGRAMOBJECTS =
    `UPDATE t_diagramobjects
SET object_id=$1
WHERE object_id=$2`;

const MERGE_OBJECTTAGS =
    `
UPDATE t_objectproperties
SET object_id=$1
WHERE object_id=$2 
AND property NOT IN(SELECT property FROM t_objectproperties WHERE object_id=$1)
`;

/**
 * 
 * @param {t_object} target 
 * @param {t_object} source 
 * @returns {Promise}
 */
export const mergeClassifiers = (target, source) => eaRepository.query(MERGE_CLASSIIFIERS,
    target.object_id, target.ea_guid, source.object_id, source.ea_guid);

/**
 * 
 * @param {t_object} target 
 * @param {t_object} source 
 * @returns {Promise}
 */
export const mergeConnectors = (target, source) => Promise.all([
    eaRepository.query(MERGE_CONNECTORS_START, target.object_id, source.object_id),
    eaRepository.query(MERGE_CONNECTORS_END, target.object_id, source.object_id)
]);

/**
 * 
 * @param {t_object} target 
 * @param {t_object} source 
 * @returns {Promise}
 */
export const mergeDiagramObjects = (target, source) => eaRepository.query(
    MERGE_DIAGRAMOBJECTS,
    target.object_id, source.object_id);

/**
* 
* @param {t_object} target 
* @param {t_object} source 
* @returns {Promise}
*/
export const mergeObjectTags = (target, source) => eaRepository.query(
    MERGE_OBJECTTAGS,
    target.object_id, source.object_id);