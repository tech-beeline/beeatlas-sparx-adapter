import Repository,
{
	t_object
} from '../sparx-ea-repository/index.mjs';

import { NotFound, NotImplemented } from '../../../utils/errors.mjs';
import { PREPARE_CONTAINERS_PACKAGE } from '../sql/system-container-sql.mjs';
import { CTE_REALIZATION, CTE_SYSTEMS } from './systems-cte.mjs';
import { SELECT_SYSTEM_SUBPACKAGES, SELECT_SYSTEMS } from './systems-queries.mjs';
import { SELECT_SYSTEM_CONTAINERS, SELECT_SYSTEM_CONTAINERS_BY_SYS_CODE } from './systems-containers-queries.mjs';
import { APP_CATALOG_ROOT } from '../../../resources/const.mjs';
import { SystemDTO, SystemDTOInternal } from './model.mjs';
import { SparxRepositoryPackagesOptions } from '../sparx-ea-repository/options.mjs';
import { DEFAULT_STATUS, REMOVED_STATUS, SYSTEM_SUBPACKAGES as SYSTEM_SUBPACKAGES_NAMES } from './const.mjs';

const CONTAINER_STEREOTYPE = 'C2';

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

const SELECT_SYSTEM_CAPABILITIES = `WITH RECURSIVE cte_sys AS(
	SELECT object_id
	FROM t_object sys
	WHERE sys.alias=$1 and sys.object_type='Component'
),
cte_sys_pack AS( 
	SELECT
		rp.package_id
	FROM t_object ro 
		JOIN t_package rp ON rp.ea_guid=ro.ea_guid
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

const isContainersEqual = (a, b) => a.name === b.name && a.description === b.description && a.status === b.status && a.version === b.version;

export class SystemsRepository {
	/**
	 * 
	 * @returns {Promise<Array<SystemDTO>>}
	 */
	async selectSystems() {
		return Repository.queryRows(SELECT_SYSTEMS)
			.then(rows=>rows.map(r => new SystemDTOInternal(r)));
	}
	/**
	 * 
	 * @returns {Promise<SystemDTO | null>}
	 */
	async selectSystemByCode(code) {
		const rows = await Repository.queryRows(`${SELECT_SYSTEMS} WHERE code=$1`, [code]);
		/* [ ] Изменить обработку множественных записей с одним кодом (несколько папок)
		if (rows.length > 1) {
			throw Error(`Too many system with code="${code}"`);
		}
			*/
		return rows.length ? new SystemDTOInternal(rows[0]) : null;
	}

	async setSystem(code, name, description, author, version, status) {
		const systemDTO = await this.selectSystemByCode(code);
		if (!systemDTO) throw NotFound(`System with code=${code} not found`);

		let techPackageId = systemDTO.package_id;


		const subpackages = techPackageId ? (await Repository.queryRows(SELECT_SYSTEM_SUBPACKAGES, [techPackageId, SYSTEM_SUBPACKAGES_NAMES])) : [];

		if (!techPackageId) {
			console.info('Technical package for system not found');
			if (!SparxRepositoryPackagesOptions.TechCapabilitiesCatalogue) {
				throw Error('TechCapabilitiesCatalogue not found');
			}

			const newPackage = await Repository.createPackage({
				parent_id: SparxRepositoryPackagesOptions.TechCapabilitiesCatalogue.package_id,
				name: systemDTO.name,
				alias: code
			});
			console.info(`Technical package for system with code=${code} created`);
			techPackageId = newPackage.package_id;
		}

		const packageToCreate = SYSTEM_SUBPACKAGES_NAMES.filter(n => !subpackages.find(r => r.name === n));
		if (packageToCreate.length) {
			console.info('start create system subpackages:', packageToCreate);
			const newPackages = await Promise.all(packageToCreate.map(subpackageName => Repository.createPackage({
				parent_id: techPackageId,
				name: subpackageName
			})));

			subpackages.push(...newPackages.map(p => ({ name: p.name, package_id: p.package_id })));
			console.info('Packages created');
		}

		return new SystemDTOInternal({ ...systemDTO, package_id: techPackageId, subpackages: subpackages, package_id: systemDTO.package_id, object_id: systemDTO.object_id });

	}

	/**
	 * @returns {Promise<Array<{ sys_code, sys_name, code, name, description, version, status}>>}
	 */
	async selectSystemsContainers() {
		return Repository.queryRows(SELECT_SYSTEM_CONTAINERS)
	}

	/**
	 * 
	 * @returns {Promise}
	 */
	async selectSystemsLegacy() {
		return Repository.queryRows(SELECT_ALL);
	}
	/**
	 * 
	 * @returns {Promise}
	 */
	async selectSystemByCodeLegacy(code) {
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

	async #insertContainer(system_id, containerPackageId, name, code, author, version, description, status) {
		const container = await Repository.createObject({
			package_id: containerPackageId,
			name: name,
			object_type: "Component",
			author: author,
			alias: code,
			version: version,
			note: description,
			status: status,
			stereotype: CONTAINER_STEREOTYPE,
			backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
		});

		await Repository.putConnector(system_id, container.object_id, 'Realisation');

		return { name: container.name, description: container.note, container_id: container.object_id, code: container.alias };
	}

	async setSystemContainers(systemCode, containers = []) {

		/** @type {SystemDTOInternal} */
		const systemDTO = await this.setSystem(systemCode);

		const containersDiffMap = (await this.selectSystemContainers(systemCode)).reduce((cm, c) => ((cm[c.code] = { current: c }), cm), {});
		for (const tc of containers) {
			if (!tc.status) tc.status = DEFAULT_STATUS;
			const containerDiff = containersDiffMap[tc.code] ?? (containersDiffMap[tc.code] = {});
			containerDiff.target = tc;
			containerDiff.needUpdate = containerDiff.current && !isContainersEqual(containerDiff.current, tc);
		}

		// Не удаляем, а устанавливаем статус в удаленный
		Object.values(containersDiffMap).filter(c => !c.target && c.current.status !== REMOVED_STATUS).forEach(diff => {
			diff.target = diff.current;
			diff.target.status = REMOVED_STATUS;
			diff.needUpdate = true;
		});

		/** @type {Array<{current, target, needUpdate}>} */
		const containersToInsert = Object.values(containersDiffMap).filter(c => !c.current);
		const containersToUpdate = Object.values(containersDiffMap).filter(c => c.needUpdate);

		if (containersToInsert.length) console.log('add new containers:', containersToInsert.map(c => c.target));

		const newContainers = await Promise.all(containersToInsert.map(diff => this.#insertContainer(
			systemDTO.object_id,
			systemDTO.containerPackageId,
			diff.target.name,
			diff.target.code,
			diff.target.author,
			diff.target.version,
			diff.target.description,
			diff.target.status
		)));

		if (containersToUpdate.length) console.log('update containers:', containersToUpdate);

		await Promise.all(
			containersToUpdate.map(diff => this.updateContainer(
				diff.target.name,
				diff.target.code,
				diff.target.author,
				diff.target.version,
				diff.target.description,
				diff.target.status))
		);
	}

	async updateContainer(name, code, author, version, description, status) {
		return Repository.update(t_object,
			{ name: name, author: author, version: version, note: description, status: status },
			{ alias: code, stereotype: "C2" });
	}

	async markContainerRemoved(name, code) {
		return Repository.update(t_object,
			{ name: `[REMOVED!]${name}`, status: "REMOVED" },
			{ alias: code, stereotype: "C2" });
	}
}
