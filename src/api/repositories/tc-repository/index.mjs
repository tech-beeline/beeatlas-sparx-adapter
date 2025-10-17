import { NotFound, NotImplemented } from '../../../utils/errors.mjs';
import TechnicalCapability from '../../model/technical-capability-model.mjs';
import { BCRepository, bcRepository } from '../capabilities-repository/bc-repoository.mjs';
import { SystemsRepository } from '../index.mjs';
import { KeyValueCache } from '../key-value-cache/index.mjs';
import Repository, { ARCHIMATE_AGGREGATION, t_diagramobjects, t_object, t_package, t_xref } from '../sparx-ea-repository/index.mjs'

import { SparxRepositoryPackagesOptions } from '../sparx-ea-repository/options.mjs';
import { ARCHIMATE_TECH_CAPABILITY } from '../sparx-ea-repository/stereotypes/index.mjs';
import { TC_PACKAGE_NAME, TC_TAGS_NAMES } from './const.mjs';
import { TCDto } from './model.mjs';
import { SELECT_BC_FOR_TC, SELECT_PARENT_BC, prepareBcRealizationDiagram, DELETE_BC_TC_LINKS, DELETE_BC_TC_CONNECTOR } from './tc-parents-queries.mjs';
import { SELECT_ALL_APP_TC_BY_CODE, SELECT_ALL_TEC, SELECT_TC_BY_CODE, SELECT_TC_OBJECT_ID } from './tc-queries.mjs';

/**
 * 
 * @param {BCRepository} bcRep
 * @returns {Promise<>}
 */
async function loadAllTC(bcRep) {
	/**@type {Array<{sys_code, code, parent_code, name, author, description, status, version, object_id, createddate, modifieddate, goal_from, goal_to}>} */
	const rows = await Repository.query(SELECT_ALL_TEC);
	const tc_map = {};
	for (const row of rows) {
		const code = row.code.toLowerCase();
		const bc = await bcRep.byCode(row.parent_code);
		if (!bc) {
			console.warn(`Для ТС [${code}] не найдена родителськая BC с кодом ${row.parent_code}`);
			continue;
		}
		/**@type {TCDto} */
		const tc = tc_map[code] ?? (tc_map[code] = new TCDto(row));
		tc.addParentCode(row.parent_code);
	}
	return Object.values(tc_map);
}

export class TechnicalCapabilitiesRepository {
	#bcRepository = bcRepository;
	#cache = new KeyValueCache({
		key: "code", entity: "TC", loadFn: async () => loadAllTC(bcRepository)
	});
	/**
	 * 
	 * @returns {Promise<TCDto[]>}
	 */
	async all() {
		return this.#cache.all();
	}
	/**
	 * 
	 * @param {stirng} code 
	 * @returns {Promise<TCDto>}
	 */
	async byCode(code) {
		return this.#cache.byKey(code);
	}

	/**
	 * Получить сырой t_object по коду ТС. Предполагается, что такая записьсуществует и уникальна. 
	 * В противном случае генерируется исключения
	 * @param {string} code 
	 * @returns {Promise<t_object>}
	 */
	async #selectTCObject(code) {
		const currentTcList = await Repository.queryRows(SELECT_TC_OBJECT_ID, [code]);
		if (!currentTcList.length) throw NotFound(`TC with code ${code} not found`);
		if (currentTcList.length > 1) throw Error(`Слишком много ТС с кодом ${code}`);
		return currentTcList[0];
	}

	/**
	  * 
	  * @param {TechnicalCapability} tc
	  */
	async updateTC(tc) {
		const { code, name, description, author, status, version } = tc;

		/**
		 * @type { t_object[]}
		 */
		const currentTC = await this.#selectTCObject(code);
		/**@type {t_object} */
		const tc_row = await Repository.update(t_object, {
			name: name,
			note: description,
			author: author,
			version: version,
			status: status,
			modifiedDate: new Date()
		}, { object_id: currentTC.object_id });
		tc.author = tc_row.author;
		tc.status = tc_row.status;
		tc.createdDate = tc_row.createddate;
		tc.modifiedDate = tc_row.modifieddate;

		return Repository.updateObjectTags(currentTC.object_id, tc, TC_TAGS_NAMES);
	}

	/**
	 * 
	 * @returns {Promise<Array<{ bc_code, bc_name, tc_code}>>}
	 */
	async selectParentBC() {
		return Repository.queryRows(SELECT_PARENT_BC, [SparxRepositoryPackagesOptions.BusinessCapabilitiesCatalogue.ea_guid]);
	}

	/**
	 * @param {string} tcCode
	 * @returns {Promise<Array<{ bc_code, bc_name, tc_code}>>}
	 */
	async selectParentBCForTC(tcCode) {
		return Repository.queryRows(SELECT_BC_FOR_TC, [SparxRepositoryPackagesOptions.BusinessCapabilitiesCatalogue.ea_guid, tcCode]);
	}

	/**
	 * 
	 * @param {string} tcCode Код технической возможности
	 * @param {Array<string>} bcCodes Список кодов возможностей, в реализации которы участвет ТС
	 */
	async setParentsBCForTC(tcCode, bcCodes) {
		/** @type {t_object} */
		const tc_object = await this.#selectTCObject(tcCode);

		for (const bcCode of bcCodes) {
			/** @type {t_object} */
			const bc_object = await Repository.first(t_object, { alias: bcCode });

			const diagramInfo = await prepareBcRealizationDiagram(bc_object);

			const diagramObjects = await Repository.getDiagramObjects(diagramInfo.diagram_id);
			const maxRight = Math.max(0, ...diagramObjects.map(o => o.rectright));

			await Repository.putDiagramObject(diagramInfo.diagram_id, { object_id: bc_object.object_id, recttop: -35, rectleft: maxRight + 50, rectbottom: -105, rectright: maxRight + 150 });
			await Repository.putDiagramObject(diagramInfo.diagram_id, { object_id: tc_object.object_id, recttop: -275, rectleft: maxRight + 50, rectbottom: -350, rectright: maxRight + 150 });

			const connector = await Repository.putConnector(bc_object.object_id, tc_object.object_id, ARCHIMATE_AGGREGATION);
			await Repository.putDiagramLink(diagramInfo.diagram_id, { connectorid: connector.connector_id, geometry: 'EDGE=3;$LLB=;LLT=;LMT=;LMB=;LRT=;LRB=;IRHS=;ILHS=;' })
		}
	}
	async removeParentsBCForTC(tcCode, bcCodes) {
		await Repository.queryOne(DELETE_BC_TC_LINKS, [tcCode, bcCodes]);
		return Repository.queryOne(DELETE_BC_TC_CONNECTOR, [tcCode, bcCodes]);
	}

	async updateParentBcForTC(tcCode, bcCodeList) {
		const currentParentCodes = (await this.selectParentBCForTC(tcCode)).map(v => v.bc_code)
		const newParentCodes = bcCodeList.filter(bc => !currentParentCodes.includes(bc));
		const parentsForRemove = currentParentCodes.filter(bc => !bcCodeList.includes(bc));


		for (const parentCode of newParentCodes) {
			if (!await bcRepository.byCode(parentCode)) {
				throw Error(`BC с кодом ${parentCode} не найдена`);
			}
		}

		return Promise.all([
			this.setParentsBCForTC(tcCode, newParentCodes),
			this.removeParentsBCForTC(tcCode, parentsForRemove)
		])
	}

	/**
	 * 
	 * @param {TechnicalCapability} tc 
	 * @returns 
	 */
	async insertTC(tc) {
		let sys_package = await Repository.getPackageByAlias(tc.system.code);

		if (!sys_package) {
			const tc_catalogue_package = await Repository.first(t_package, { ea_guid: SparxRepositoryPackagesOptions.TechCapabilitiesCatalogue.ea_guid });
			const system = await new SystemsRepository().selectSystemByCode(tc.system.code);
			const system_name = system?.name ?? tc.system.code;
			sys_package = await Repository.createPackage({ name: system_name, alias: tc.system.code, parent_id: tc_catalogue_package.package_id });
		}

		const tc_package = await Repository.putPackage({ parent_id: sys_package.package_id, name: TC_PACKAGE_NAME })

		const tc_object = await Repository.createObject({
			alias: tc.code,
			package_id: tc_package.package_id,
			name: tc.name,
			object_type: ARCHIMATE_TECH_CAPABILITY,
			author: tc.author ?? "FDM API",
			note: tc.description,
			status: "Created",
			version: tc.version
		});
		tc.createdDate = tc_object.createddate;
		tc.modifiedDate = tc_object.modifieddate;
		tc.status = tc_object.status;
		tc.author = tc_object.author;
		tc.version = tc_object.version;

		return Repository.updateObjectTags(tc_object.object_id, tc, TC_TAGS_NAMES);
	}

	async selectAppTcByCode(appCode, tcCode) {
		return Repository.query(SELECT_ALL_APP_TC_BY_CODE, appCode, tcCode)
	}
}

export const tcRepository = new TechnicalCapabilitiesRepository();

export default tcRepository;