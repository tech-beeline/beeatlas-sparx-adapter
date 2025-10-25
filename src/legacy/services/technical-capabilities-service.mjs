import TechnicalCapability from "../model/technical-capability-model-legacy.mjs";
import { tcRepository, TechnicalCapabilitiesRepository } from '../../api/repositories/index.mjs'

import Repository, {
	ARCHIMATE_AGGREGATION,
	t_object,
	t_diagram,
	t_diagramobjects,
	t_xref,
	t_connector,
	t_diagramlinks,
	t_package
} from "../../api/repositories/sparx-ea-repository/index.mjs";

import { BadRequest, ConflictException, NotFound, NotImplemented } from "../../utils/errors.mjs";

import APP_CATALOG, { APP_PACKAGE } from "./sql/application-catalog.mjs";
import TC_QUERY from './sql/tech-capabilities.mjs'

import applicationService from "./application-service.mjs";
import { ArchMetricsRepository } from "../../api/repositories/index.mjs";
import { TC_TAGS_NAMES } from "../../api/repositories/tc-repository/const.mjs";
import { tcService } from "../../client/src/resources/services/tc-service.mjs";
import { TCServiceInstance, TechnicalCapabiliiesService } from "../../api/services/index.mjs";


const STEREOTYPE_MAP = {
	ArchiMate_Capability: 'BC',
	ArchiMate_TechnicalCapability: ' TC',
	type: (s) => STEREOTYPE_MAP[s] ?? 'Unknown'
}

const tcDataService = tcRepository;

class TechnicalCapabilityService {
	static app_package;

	async getTechnicalCapabilities() {
		return TCServiceInstance.getAll();
	}

	/**
	 * 
	 * @param {{code}} param0 
	 * @returns {Promise<TechnicalCapability>}
	 */
	async getTechnicalCapability({ code } = {}) {
		if (!code) throw BadRequest('Не указан code для получения capability');
		return TCServiceInstance.getByCode(code);
	}
	/**
 * 
 * @param {*} capability 
 * @returns {Promise<{system_package : {package_id, alias}, parents_bc : Array<t_object>, tc_package : t_object}>}
 */
	async #prepareTCRelatedObjects(capability) {
		/**
		 * @type {{ code, package_id}}
		 */
		let system_package = await Repository.queryOne({ text: APP_CATALOG.APP_PACKAGE_QUERY, values: [capability.targetSystemCode] })
		if (!system_package) {
			if (!TechnicalCapabilityService.app_package) TechnicalCapabilityService.app_package = await Repository.first(t_package, { ea_guid: APP_PACKAGE });
			if (!TechnicalCapabilityService.app_package) throw Error(`Не удалось найти корневую папку (ea_guid=${APP_PACKAGE}) для создания папки приложения ${capability.targetSystemCode}`);
			const app_catalog = await applicationService.getApplications();
			const system_name = app_catalog.applications[capability.targetSystemCode]?.name ?? capability.targetSystemCode;
			system_package = await Repository.createPackage({ name: system_name, alias: capability.targetSystemCode, parent_id: TechnicalCapabilityService.app_package.package_id })
		}

		let parents_bc = (await Repository.queryRows('select * from t_object where alias = ANY($1)', [capability.parents]));
		parents_bc = parents_bc.reduce((acc, v) => (acc[v.alias] = v, acc), {});

		capability.parents.forEach(code => {
			if (!parents_bc[code]) throw NotFound(`BC with code ${code} not found`);
		});
		return {
			system_pacakge: system_package, parents_bc: parents_bc,
			tc_package: await Repository.putPackage({ parent_id: system_package.package_id, name: TC_QUERY.TC_PACKAGE_NAME })
		};
	}

	/**
	 * 
	 * @param {TechnicalCapability} capability 
	 * @returns 
	 */
	async #createTC(capability) {
		const { system_package, parents_bc, tc_package } = await this.#prepareTCRelatedObjects(capability)

		const tc = await Repository.createObject({
			alias: capability.code,
			package_id: tc_package.package_id, name: capability.name, object_type: "Class",
			author: "FDM API", alias: capability.code,
			note: capability.description,
			scope: 'Public', parentid: '0', classifier: '0', pdata4: '0',
			stereotype: TechnicalCapability.STEREOTYPE,
			backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1, status: "Created",
			version: capability.version
		});

		ArchMetricsRepository.onTCChanged({ code: capability.code, name: capability.name, change_date: tc.modifieddate });

		await Repository.insert(t_xref, t_xref.ArchimateElementStereotype({ guid: tc.ea_guid, stereotype: TechnicalCapability.STEREOTYPE }));

		tc.code = tc.alias;
		tc.description = tc.note;

		for (let bc of Object.values(parents_bc)) {
			await this.addParentBC(tc, bc);
		}
		await Repository.updateObjectTags(tc.object_id, capability, TC_TAGS_NAMES);

		return this.getTechnicalCapability({ code: tc.alias });
	}
	/**
	 * 
	 * @param {String} code 
	 * @param {TechnicalCapability} capability 
	 * @returns {Promise<TechnicalCapability>}
	 */
	async putTechnicalCapability(code, capability) {
		// Проверки
		if (!capability) throw BadRequest(`Capability is null`);
		if (!capability.parents || !capability.parents.length) throw BadRequest('Для ТС должны быть указаны родительские BC (parents)');
		/**
		 * @type {t_object}
		 */
		let ea_capability = await Repository.first(t_object, { alias: code });

		if (!ea_capability) {
			return this.#createTC(capability);
		}


		if (ea_capability.name !== capability.name || ea_capability.note !== capability.description || ea_capability.version !== capability.version) {
			await Repository.update(t_object, { name: capability.name, note: capability.description, version: capability.version }, { object_id: ea_capability.object_id })
			ArchMetricsRepository.onTCChanged({ code: code, name: capability.name })
		}

		await Repository.updateObjectTags(ea_capability.object_id, capability, TC_TAGS_NAMES);

		const asis_tc = await this.getTechnicalCapability({ code: code });
		if (!asis_tc) {
			let parents_bc = (await Repository.queryRows('select * from t_object where alias = ANY($1)', [capability.parents]));
			for (const bc of parents_bc) {
				await this.addParentBC(ea_capability, bc);
			}
			return this.getTechnicalCapability(capability);
		}

		if (asis_tc.targetSystemCode !== capability.targetSystemCode) {
			NotImplemented('Изменение целевой системы для ТС');
		}

		let bc_to_remove = asis_tc.parents.filter(bc => !capability.parents.some(c => c === bc));
		if (bc_to_remove.length > 0) {
			let parents_bc = (await Repository.queryRows('select distinct object_id from t_object where alias = ANY($1)', [bc_to_remove]));
			for (let bc of parents_bc) {
				await this.#removeParentBC(asis_tc.object_id(), bc.object_id);
			}
		}

		const new_parent_bc = capability.parents.filter(c => !asis_tc.parents.some(bc => bc === c));

		if (new_parent_bc.length > 0) {
			let parents_bc = (await Repository.queryRows('select distinct object_id from t_object where alias = ANY($1)', [new_parent_bc]));
			for (const bc of parents_bc) {
				await this.addParentBC(ea_capability, { object_id: bc.object_id });
			}
		}

		return this.getTechnicalCapability(capability);
	}

	/**
	 * 
	 * @param {TechnicalCapability} capability 
	 */
	async postTechnicalCapability(capability) {
		if (!capability) throw BadRequest(`Capability is null`);
		if (!capability.parents || !capability.parents.length) throw BadRequest('Для создаваемой ТС должны быть указаны родительские BC (parents)')
		if (await Repository.first(t_object, { alias: capability.code })) throw ConflictException(`TC c кодом ${capability.code} уже существует`);
		return this.#createTC(capability);
	}

	async #removeParentBC(tc_id, bc_id) {
		const bc_package = await Repository.queryOne(TC_QUERY.BC_PACKAGE_QUERY_BY_ID, [bc_id]);
		/** @type {t_diagram} */
		const diagram = await Repository.putDiagram({ package_id: bc_package.package_id, name: TC_QUERY.BC_TC_DIAGRAM_NAME, diagram_type: 'Component', author: 'FDM API' });
		let parent_do = await Repository.first(t_diagramobjects, { diagram_id: diagram.diagram_id, object_id: bc_id });

		let connector = await Repository.queryOne(`select distinct connectorid
		from t_diagramlinks l
		where l.diagramid=16466 and connectorid in ( select connector_id from t_connector where end_object_id=$1 and start_object_id =$2 )`, [tc_id, bc_id]);
		if (!connector)
			return;

		await Repository.queryOne(`delete from t_diagramlinks where connectorid=$1`, [connector.connectorid]);
		await Repository.queryOne(`delete from t_connector where connector_id=$1`, [connector.connectorid]);
	}

	async #prepareBCDiagram(bc) {
		if (bc.object_type === 'Package') { // BC является доменом
			const pkg = await Repository.first(t_package, { ea_guid: bc.ea_guid });
			return Repository.putDiagram({ package_id: pkg.package_id, name: TC_QUERY.BC_TC_DIAGRAM_NAME, diagram_type: 'Component', author: 'FDM API' });
		}
		const bc_package = await Repository.queryOne(TC_QUERY.BC_PACKAGE_QUERY_BY_ID, [bc.object_id]);
		if (!bc_package) throw Error(`Не найдена папка, где лежит диграмма для BC ${bc.name}`);

		// [ ] ДОбавить обработку  отсутсвия диаграммы для BC
		return Repository.putDiagram({ package_id: bc_package.package_id, name: TC_QUERY.BC_TC_DIAGRAM_NAME, diagram_type: 'Component', author: 'FDM API' });
	}

	async addParentBC(capability, parent) {

		const parent_id = parent.object_id;
		if (!parent_id) throw Error('not implemented');
		const capability_id = capability.object_id;
		if (!capability_id) throw Error('not implemented');

		/** @type {t_diagram} */
		const diagram = await this.#prepareBCDiagram(parent);
		let parent_do = await Repository.first(t_diagramobjects, { diagram_id: diagram.diagram_id, object_id: parent_id });

		const max_r = (await Repository.queryOne(' select max(rectright) as max_r from t_diagramobjects where diagram_id=$1', [diagram.diagram_id])).max_r ?? 0;

		if (!parent_do) {
			parent_do = await Repository.insert(t_diagramobjects,
				{
					diagram_id: diagram.diagram_id, object_id: parent_id,
					recttop: -35, rectleft: max_r + 50, rectbottom: -105, rectright: max_r + 150
				})
		};

		let tc_do = await Repository.first(t_diagramobjects, { diagram_id: diagram.diagram_id, object_id: capability_id });

		if (!tc_do) {
			tc_do = await Repository.insert(t_diagramobjects,
				{
					diagram_id: diagram.diagram_id, object_id: capability_id,
					recttop: -275, rectleft: max_r + 50, rectbottom: -350, rectright: max_r + 150
				});
		}
		/** @type {t_connector} */
		const connector = await Repository.putConnector(parent_id, capability_id, ARCHIMATE_AGGREGATION);
		await Repository.insert(t_diagramlinks, { diagramid: diagram.diagram_id, connectorid: connector.connector_id, geometry: 'EDGE=3;$LLB=;LLT=;LMT=;LMB=;LRT=;LRB=;IRHS=;ILHS=;' });
	}
}

export default new TechnicalCapabilityService();