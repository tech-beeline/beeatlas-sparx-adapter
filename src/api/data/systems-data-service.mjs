import Repository from '../../utils/ea-repo.mjs'
import { APP_CATALOG_ROOT } from '../../resources/const.mjs';
import { NotImplemented } from '../../utils/errors.mjs';
import { PREPARE_CONTAINERS_PACKAGE } from './sql/system-container-sql.mjs';
import t_object from '../../utils/ea-model/t_object.mjs';

const CONTAINER_STEREOTYPE = 'C2';

const CTE_SYSTEM_CATALOG = `cte_sys_catalog AS (
    SELECT package_id, package_id AS parent_id, name , name::text AS "FQName", ea_guid
        FROM t_package WHERE ea_guid='${APP_CATALOG_ROOT}'
    UNION DISTINCT
    SELECT c.package_id, p.parent_id, c.name, p."FQName"::text || '/' || c.name, c.ea_guid
            FROM cte_sys_catalog p
            JOIN t_package c ON c.parent_id=p.package_id
)`;

const CTE_SYSTEMS = `${CTE_SYSTEM_CATALOG}, 
cte_systems AS (
    SELECT sys.object_id, sys.name as system, sys.ea_guid, sys.alias AS sys_code, sys.note AS sys_description, sys.author, sys.status, sys.modifiedDate AS "modifiedDate", sys.version,
		cat."FQName" || '/' || sys.name AS "FQName", cat.name AS "packageName"
		FROM cte_sys_catalog cat
		JOIN t_object sys ON sys.package_id=cat.package_id AND sys.object_type='Component' AND sys.alias is not null AND sys.stereotype IS null)
`;

const CTE_REALIZATION = `cte_realization AS ( select 
    DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation')`

const SELECT_ONLY_SYSTEMS = `WITH RECURSIVE ${CTE_SYSTEMS}
SELECT * FROM cte_systems`

const SELECT_ALL = `WITH RECURSIVE ${CTE_SYSTEMS},
${CTE_REALIZATION}
SELECT sys.*, 
	c.name AS container,c.alias AS container_code, c.version as container_version, c.note as container_description, c.object_id as container_id, c.status as container_status,
	it.name as interface, it.alias as interface_code, it.version as interface_version, it.note as interface_description, it.object_id as interface_id, it.status as interface_status
FROM cte_systems sys
	LEFT JOIN cte_realization c ON c.start_object_id=sys.object_id AND c.object_type='Component' AND c.alias is not null and c.stereotype='C2'
	LEFT JOIN cte_realization it ON it.start_object_id=c.object_id AND it.object_type='Interface' AND it.alias is not null AND it.alias <> ''`

const SELECT_SYSTEM_CONTAINERS = `WITH ${CTE_REALIZATION}
    SELECT
        sys.alias as sys_code,
        sys.name as sys_name,
        cn.alias as code,
        cn.name,
        cn.note as description,
        cn.version,
        cn.status
    FROM t_object sys
        JOIN cte_realization cn ON cn.start_object_id=sys.object_id AND cn.stereotype='C2'
    WHERE sys.object_type='Component'`

const SELECT_SYSTEM_CONTAINERS_BY_SYS_CODE = `WITH ${CTE_REALIZATION}
    SELECT
        sys.alias as sys_code,
        sys.name as sys_name,
        cn.alias as code,
        cn.name,
        cn.note as description,
        cn.version,
        cn.status
    FROM t_object sys
        JOIN cte_realization cn ON cn.start_object_id=sys.object_id AND cn.stereotype='C2'
    WHERE sys.object_type='Component' AND sys.alias=$1`

const SELECT_SYSTEM_CAPABILITIES = `WITH RECURSIVE cte_sys AS(
	SELECT object_id
	FROM t_object sys
	WHERE sys.alias=$1 and sys.object_type='Component'
),
cte_sys_pack AS( 
	SELECT
		tcp.package_id
	FROM t_object ro 
		JOIN t_package rp ON rp.ea_guid=ro.ea_guid
		JOIN t_package tcp ON tcp.parent_id=rp.package_id
	WHERE ro.alias=$1 AND object_type='Package'
	UNION ALL
	SELECT c.package_id
	FROM cte_sys_pack p
		JOIN t_package c ON c.parent_id=p.package_id 
),
cte_realization AS ( 
	SELECT DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation'),
cte_tc as (
	SELECT DISTINCT
		tc.name, tc.object_id, tc.alias, tc.stereotype
	FROM cte_sys sys
		JOIN t_connector irel ON irel.start_object_id=sys.object_id
		JOIN t_object it ON it.object_id=irel.end_object_id AND it.object_type='Interface'
		JOIN t_connector srel ON srel.start_object_id=it.object_id
		JOIN t_object sr ON sr.object_id=srel.end_object_id
		JOIN t_connector tcr ON tcr.start_object_id=sr.object_id
		JOIN t_object tc ON tc.object_id=tcr.end_object_id AND tc.stereotype='ArchiMate_TechnicalCapability'
	UNION DISTINCT
	SELECT tc.name, tc.object_id, tc.alias as code, tc.stereotype
	FROM cte_sys sys
		JOIN cte_realization c ON c.start_object_id=sys.object_id AND c.object_type='Component' AND c.alias is not null and c.stereotype='C2'
		JOIN cte_realization it ON it.start_object_id=c.object_id AND it.object_type='Interface' AND it.alias is not null AND it.alias <> ''
		JOIN cte_realization tc ON tc.start_object_id=it.object_id AND tc.stereotype='ArchiMate_TechnicalCapability' AND tc.alias is not null AND tc.alias <> ''
	UNION DISTINCT
	SELECT tc.name, tc.object_id, tc.alias, tc.stereotype
	FROM cte_sys_pack p
		JOIN t_object tc ON tc.package_id=p.package_id AND tc.stereotype='ArchiMate_TechnicalCapability' AND tc.alias is not null AND tc.alias <> ''
),
cte_aggregation as (
	SELECT  
		c.object_id as child_id, p.object_id as parent_id
	FROM  t_object c
		JOIN t_package cp ON cp.ea_guid=c.ea_guid
		JOIN t_package pp on pp.package_id=cp.parent_id
		JOIN t_object p ON p.ea_guid=pp.ea_guid AND p.alias is not null
	WHERE c.alias like 'DMN%' or c.alias like 'GRP%'
	UNION
	SELECT end_object_id, start_object_id
	FROM t_connector
	WHERE stereotype='ArchiMate_Aggregation'
),
cte_capability AS (
	SELECT tc.name as name, tc.object_id, tc.object_id as tc_id, tc.object_id as child_id, tc.alias as code, tc.stereotype--, tc.name::text as context
	FROM cte_tc tc 
	UNION DISTINCT
	SELECT bc.name, bc.object_id, ch.tc_id, ch.object_id, bc.alias, coalesce( bc.stereotype, bc.object_type )--, ch.context || '/' || bc.name
	FROM cte_capability ch
		JOIN cte_aggregation rel ON rel.child_id=ch.object_id 
		JOIN t_object bc ON bc.object_id=rel.parent_id AND (bc.stereotype='ArchiMate_Capability' OR bc.object_type='Package')
)
SELECT distinct name, code, object_id, child_id,stereotype FROM cte_capability`;

const SELECT_SYSTEM_PARTICIPITION = `WITH RECURSIVE
cte_sys_catalog AS (
	SELECT package_id, package_id AS parent_id, name 
		FROM t_package WHERE ea_guid='${APP_CATALOG_ROOT}'
	UNION DISTINCT
	SELECT c.package_id, p.parent_id, c.name
		FROM cte_sys_catalog p
		JOIN t_package c ON c.parent_id=p.package_id
),
cte_sys AS (
	SELECT sys.name, sys.ea_guid, sys.alias as code, sys.object_id as sys_id
	FROM cte_sys_catalog cat
		JOIN t_object sys ON sys.package_id=cat.package_id AND sys.alias = $1 AND sys.object_type='Component'
),
cte_realization AS ( 
	SELECT DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation'),
cte_sys_obj AS (
    SELECT  sys.name as sys_name, sys.name, sys.code AS sys_code, sys.ea_guid, sys.code, sys.sys_id, sys.sys_id as object_id
    FROM cte_sys sys
    UNION -- Provided interfaces
    SELECT sys.name, it.name, sys.code, it.ea_guid, it.alias, sys.sys_id, it.object_id
    FROM cte_sys sys
        JOIN t_object it ON it.parentid=sys.sys_id AND it.object_type='ProvidedInterface'
    UNION DISTINCT -- containers from structurizr
    SELECT sys.name, c.name, sys.code, c.ea_guid, c.alias, sys.sys_id, c.object_id
    FROM cte_sys sys
        JOIN cte_realization c ON c.start_object_id=sys.sys_id AND c.stereotype='C2'
    UNION DISTINCT -- interfaces from structurizr
    SELECT sys.name, it.name, sys.code, it.ea_guid, it.alias, sys.sys_id, it.object_id
    FROM cte_sys sys
        JOIN cte_realization c ON c.start_object_id=sys.sys_id AND c.stereotype='C2'
        JOIN cte_realization it ON it.start_object_id=c.object_id AND it.object_type='Interface'
),
cte_bi AS (
	SELECT e2e.name as process, e2e.ea_guid as process_uid, bi.name as bi_name, bi.ea_guid as bi_uid, bi.pdata1::integer as bi_id
	FROM t_diagram e2e
		JOIN t_diagramobjects bi_do ON bi_do.diagram_id=e2e.diagram_id
		JOIN t_object bi ON bi.object_id=bi_do.object_id AND bi.object_type='InteractionOccurrence'
	WHERE e2e.stereotype='e2e_diagram'
),
cte_dia_ref AS (
	SELECT od.diagram_id, d.name , d.ea_guid, d.diagram_id AS child_id
	FROM t_xref x
		JOIN t_object o ON o.ea_guid=x.client
		JOIN t_diagram d ON d.ea_guid=x.supplier AND d.diagram_type='Sequence'
		JOIN t_diagramobjects od ON od.object_id=o.object_id AND od.diagram_id <> d.diagram_id
	where x.name='DefaultDiagram'
),
cte_bi_dia AS (
	SELECT bi.process, bi.process_uid, bi.bi_name, bi.bi_uid, bi.bi_id, bi.bi_id as diagram_id, bi.bi_uid as diagram_uid, bi.bi_name as diagram, bi.bi_id as child_id
	FROM cte_bi bi
	UNION DISTINCT
	SELECT bi.process, bi.process_uid, bi.bi_name, bi.bi_uid, bi.bi_id,ref.diagram_id, ref.ea_guid, ref.name, ref.child_id
	FROM cte_bi_dia bi
		JOIN cte_dia_ref ref ON ref.diagram_id=bi.child_id
), cte_sys_msg AS (
    SELECT 
        o.sys_code, o.sys_name, o.name as component,
        msg.seqno, msg.name as message, mtd.name as operation, it.name as interface, it.ea_guid as interface_uid, op.value as operation_guid,
        d.*
    FROM cte_bi_dia d
        JOIN t_connector msg ON msg.diagramid=d.diagram_id
        JOIN cte_sys_obj o ON o.object_id=msg.end_object_id
        LEFT JOIN t_connectortag op ON op.elementid=msg.connector_id AND op.property='operation_guid'
        LEFT JOIN t_operation mtd ON mtd.ea_guid=op.value
        LEFT JOIN t_object it ON it.object_id=mtd.object_id
)
SELECT * FROM cte_sys_msg`

const CONTAINERS_FOLDER = "Containers";

class SystemsDataService {
	/**
	 * 
	 * @returns {Promise}
	 */
	async selectOnlySystems() {
		return Repository.queryRows(SELECT_ONLY_SYSTEMS);
	}
	/**
	 * 
	 * @returns {Promise}
	 */
	async selectOnlySystemByCode(code) {
		return Repository.queryOne(`${SELECT_ONLY_SYSTEMS} WHERE sys_code=$1`, [code]);
	}
	/**
	 * 
	 * @returns {Promise}
	 */
	async selectSystems() {
		return Repository.queryRows(SELECT_ALL);
	}
	/**
	 * 
	 * @returns {Promise}
	 */
	async selectSystemByCode(code) {
		return Repository.queryRows(`${SELECT_ALL} WHERE sys_code=$1`, [code]);
	}

	/**
	 * 
	 * @param {string} systemCode 
	 * @returns {Promise<Array<{sys_code, sys_name, code, name, description,version, status}>>}
	 */
	async selectSystemContainers(systemCode) {
		return Repository.queryRows(SELECT_SYSTEM_CONTAINERS_BY_SYS_CODE, [systemCode])
	}
	async selectContainerByCode(containerCode) {
		return Repository.first(t_object, { stereotype: "C2", alias: containerCode })
			.then(r => r ? {
				code: r.alias,
				name: r.name,
				description: r.note,
				version: r.version
			} : null);
	}
	/**
	 * 
	 * @returns {Promise}
	 */
	async selectSystemCapabilities(code) {
		return Repository.queryRows(SELECT_SYSTEM_CAPABILITIES, [code]);
	}

	/**
	 * 
	 * @param {string} code 
	 * @returns {Promise}
	 */
	async selectSystemE2EParticipition(code) {
		return Repository.queryRows(`${SELECT_SYSTEM_PARTICIPITION} WHERE operation IS NOT NULL`, [code]);
	}

	/**
	 * 
	 * @param {string} systemCode 
	 * @returns {Promise<{container_package_id, sys_package_id, sys_object_id}>}
	 */
	async prepareContainerPackage(systemCode) {
		return Repository.queryOne(PREPARE_CONTAINERS_PACKAGE, [CONTAINERS_FOLDER, systemCode]);
	}

	async insertContainer(systemCode, name, code, author, version, description) {
		const [packageInfo, system] = await Promise.all([
			this.prepareContainerPackage(systemCode),
			Repository.first(t_object, { object_type: 'Component', alias: systemCode })
		]);
		if (!packageInfo) throw Error(`Package with alias=${systemCode} not found`);

		const container = await Repository.createObject({
			package_id: packageInfo.package_id,
			name: name,
			object_type: "Component",
			author: author,
			alias: code,
			version: version,
			note: description,
			stereotype: CONTAINER_STEREOTYPE,
			backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
		});

		await Repository.putConnector(system.object_id, container.object_id, 'Realisation');

		return { name: container.name, description: container.note };
	}
	async updateContainer(name, code, author, version, description) {
		return Repository.update(t_object,
			{ name: name, author: author, version: version, note: description },
			{ alias: code, stereotype: "C2" });
	}

	async markContainerRemoved(name, code) {
		return Repository.update(t_object,
			{ name: `[REMOVED!]${name}`, status: "REMOVED"},
			{ alias: code, stereotype: "C2" });
	}
}


export default new SystemsDataService();