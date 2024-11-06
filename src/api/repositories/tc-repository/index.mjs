import { NotImplemented } from '../../../utils/errors.mjs';
import { SystemsRepository } from '../index.mjs';
import Repository, { CONNECTOR_STEREOTYPES, t_diagramobjects, t_object, t_package, t_xref } from '../sparx-ea-repository/index.mjs'

import { SparxRepositoryPackagesOptions } from '../sparx-ea-repository/options.mjs';
import { TC_PACKAGE_NAME, TC_TAGS_NAMES, TECH_CAPABILITY_STEREOTYPE } from './const.mjs';
import { SELECT_BC_FOR_TC, SELECT_PARENT_BC, prepareBcRealizationDiagram, DELETE_BC_TC_LINKS, DELETE_BC_TC_CONNECTOR } from './tc-parents-queries.mjs';
import { SELECT_ALL_TEC, SELECT_TC_BY_CODE } from './tc-queries.mjs';


export class TechnicalCapabilitiesRepository {
	/**
	 * 
	 * @returns {Promise<Array<{ sys_code, sys_name, code, name, author, description, status, version, object_id, createddate, modifieddate, goal_from, goal_to}>>}
	 */
	async selectTCList() {
		return Repository.queryRows(SELECT_ALL_TEC, [SparxRepositoryPackagesOptions.TechCapabilitiesCatalogue.ea_guid])
	}

	/**
	 * 
	 * @returns {Promise<Array<{ sys_code, sys_name, code, name, author, description, status, version, object_id, createddate, modifieddate, goal_from, goal_to}>>}
	 */
	async selectTCByCode(tcCode) {
		return Repository.queryOne(SELECT_TC_BY_CODE, [SparxRepositoryPackagesOptions.TechCapabilitiesCatalogue.ea_guid, tcCode])
	}

	/**
	  * 
	  * @param {{ code, name, description, author, status, version, goal_from, goal_to }} tc
	  */
	async updateTC(tc) {
		const { code, name, description, author, status, version } = tc;
		/**
		 * @type { t_object}
		 */
		const currentTC = await Repository.first(t_object,
			{
				alias: code,
				stereotype: TECH_CAPABILITY_STEREOTYPE
			});

		if (!currentTC) throw NotFound(`TC with code ${code} not found`);

		await Repository.update(t_object, {
			name: name,
			note: description,
			author: author,
			version: version,
			status: status
		}, { object_id: currentTC.object_id });

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
		const tc_object = await Repository.first(t_object, { alias: tcCode, stereotype: TECH_CAPABILITY_STEREOTYPE }) // [ ] Можно оптимизировать, если перейти на внутренние идентификаторы sparx
		if (!tc_object) throw Error(`TC with code ${tcCode} not found`);

		for (const bcCode of bcCodes) {
			/** @type {t_object} */
			const bc_object = await Repository.first(t_object, { alias: bcCode });

			const diagramInfo = await prepareBcRealizationDiagram(bc_object);

			const diagramObjects = await Repository.getDiagramObjects(diagramInfo.diagram_id);
			const maxRight = Math.max(0, ...diagramObjects.map(o => o.rectright));

			await Repository.putDiagramObject(diagramInfo.diagram_id, { object_id: bc_object.object_id, recttop: -35, rectleft: maxRight + 50, rectbottom: -105, rectright: maxRight + 150 });
			await Repository.putDiagramObject(diagramInfo.diagram_id, { object_id: tc_object.object_id, recttop: -275, rectleft: maxRight + 50, rectbottom: -350, rectright: maxRight + 150 });

			const connector = await Repository.putConnector(bc_object.object_id, tc_object.object_id, CONNECTOR_STEREOTYPES.ARCHIMATE_AGGREGATION);
			await Repository.putDiagramLink(diagramInfo.diagram_id, { connectorid: connector.connector_id, geometry: 'EDGE=3;$LLB=;LLT=;LMT=;LMB=;LRT=;LRB=;IRHS=;ILHS=;' })
		}
	}
	async removeParentsBCForTC(tcCode, bcCodes) {
		await Repository.queryOne(DELETE_BC_TC_LINKS, [tcCode, bcCodes]);
		return Repository.queryOne(DELETE_BC_TC_CONNECTOR, [tcCode, bcCodes]);
	}

	async updateParentBcForTC(tcCode, bcCodeList) {
		const currentBCs = (await this.selectParentBCForTC(tcCode)).map(v => v.bc_code)
		const newParents = bcCodeList.filter(bc => !currentBCs.includes(bc));
		const parentsForRemove = currentBCs.filter(bc => !bcCodeList.includes(bc));
		return Promise.all([
			this.setParentsBCForTC(tcCode, newParents),
			this.removeParentsBCForTC(tcCode, parentsForRemove)
		])
	}
	async insertTC(tc) {
		let sys_package = await Repository.getPackageByAlias(tc.system.code);
		if (!sys_package) {
			const tc_catalogue_package = await Repository.first(t_package, { ea_guid: SparxRepositoryPackagesOptions.TechCapabilitiesCatalogue.ea_guid });
			const system = new SystemsRepository().selectSystemByCode(tc.system.code);
			const system_name = system?.name ?? tc.system.code;
			sys_package = await Repository.createPackage({ name: system_name, alias: tc.system.code, parent_id: tc_catalogue_package.package_id });
		}

		const tc_package = await Repository.putPackage({ parent_id: sys_package.package_id, name: TC_PACKAGE_NAME })

		const tc_object = await Repository.createObject({
			alias: tc.code,
			package_id: tc_package.package_id, name: tc.name, object_type: "Class",
			author: "FDM API",
			note: tc.description,
			scope: 'Public', parentid: '0', classifier: '0', pdata4: '0',
			stereotype: TECH_CAPABILITY_STEREOTYPE,
			backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1, status: "Created",
			version: tc.version
		});

		await Repository.insert(t_xref, t_xref.ArchimateElementStereotype({ guid: tc_object.ea_guid, stereotype: TECH_CAPABILITY_STEREOTYPE })); // [ ] Надо отрефакторить - скрыть работу со стереотипами

		return Repository.updateObjectTags(tc_object.object_id, tc, TC_TAGS_NAMES);
	}
}