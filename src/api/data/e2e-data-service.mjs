import { NotImplemented } from "../../utils/errors.mjs";
import Repository from '../../utils/ea-repo.mjs'

const E2E_PACKAGE_UID = process.env.E2E_CATALOG_UID ?? '{F486A191-8D01-471b-AD9B-271B6AD388EB}';

const CTE_E2E_CATALOG = `cte_e2e_catalog AS (
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

const CTE_E2E_PAKAGES = `cte_e2e_pkg AS  (
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


const SELECT_ALL_E2E = `WITH RECURSIVE
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
        sd.ea_guid as uid
FROM cte_e2e_pkg
	JOIN t_diagram sd ON sd.package_id=cte_e2e_pkg.package_id AND sd.stereotype='e2e_diagram'`;

const SELECT_E2E_BY_UID = `${SELECT_ALL_E2E} WHERE sd.ea_guid=$1`;


const SELECT_ALL_BI = `SELECT DISTINCT 
	ref.name,  
	odd.diagram_id, 
	d.diagram_id, 
	d.ea_guid, 
	d.name AS bi_name, 
	m.seqno
FROM t_diagram p
	JOIN t_diagramobjects odd ON odd.diagram_id=p.diagram_id 
	JOIN t_object ref ON ref.object_id=odd.object_id AND ref.object_type='InteractionOccurrence'
	JOIN t_diagram d ON d.diagram_id::text=ref.pdata1
	LEFT JOIN t_object mep on mep.parentid=ref.object_id AND mep.object_type='MessageEndpoint'
	LEFT JOIN t_connector m ON m.end_object_id=mep.object_id AND m.diagramid=p.diagram_id`;

const SELECT_E2E_BI = `${SELECT_ALL_BI} WHERE p.ea_guid=$1`

class E2EDataService {
    /**
     * @returns {Promise<>}
     */
    async selectAllE2E() {
        return Repository.queryRows(SELECT_ALL_E2E);
    }
    /**
     * @returns {Promise<>}
     */
    async selectE2EByUID(uid) {
        return Repository.queryOne(SELECT_E2E_BY_UID, [uid]);;
    }
    /**
    * @returns {Promise<>}
    */
    async selectAllBI() {
        return Repository.queryOne(SELECT_ALL_BI);;
    }
    /**
    * @returns {Promise<>}
    */
    async selectE2E_BI() {
        return Repository.queryOne(SELECT_E2E_BI);;
    }
    /**
    * @returns {Promise<>}
    */
    async selectE2EMessages() {
        NotImplemented();
    }

}
export default new E2EDataService();