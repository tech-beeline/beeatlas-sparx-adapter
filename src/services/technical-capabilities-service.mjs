import TechnicalCapability from "../model/technical-capability.mjs";
import t_diagram from "../utils/ea-model/t_diagram.mjs";
import t_diagramobjects from "../utils/ea-model/t_diagramobjects.mjs";
import t_object from "../utils/ea-model/t_object.mjs";
import t_xref from "../utils/ea-model/t_xref.mjs";
import t_package from "../utils/ea-model/t_package.mjs";
import Repository, { CONNECTOR_STEREOTYPES } from "../utils/ea-repo.mjs";
import { BadRequest, ConflictException, NotFound, NotImplemented } from "../utils/errors.mjs";
import APP_CATALOG from "./sql/application-catalog.mjs";
import TC_QUERY from './sql/tech-capabilities.mjs'
import t_diagramlinks from "../utils/ea-model/t_diagramlinks.mjs";
import t_connector from "../utils/ea-model/t_connector.mjs";


const STEREOTYPE_MAP = {
	ArchiMate_Capability: 'BC',
	ArchiMate_TechnicalCapability: ' TC',
	type: (s) => STEREOTYPE_MAP[s] ?? 'Unknown'
}

class TechnicalCapabilityService {
	async getTechnicalCapabilities() {
		const tc_map = (await Repository.queryRows(TC_QUERY.ALL_TECH_CAPABILITITES_QUERY))
			.reduce((acc, v) =>
				((acc[v.code] = acc[v.code] ?? new TechnicalCapability(v)).addParent(v.bc_code), acc), {})

		return Object.values(tc_map);
	}

	/**
	 * 
	 * @param {{code}} param0 
	 * @returns {Promise<TechnicalCapability>}
	 */
	async getTechnicalCapability({ code } = {}) {
		if (!code) throw BadRequest('Не указан code для получения capability');

		const tc_map = (await Repository.queryRows({ text: TC_QUERY.TECH_CAPABILITITY_QUERY, values: [code] }))
			.reduce((acc, v) =>
				((acc[v.code] = acc[v.code] ?? new TechnicalCapability(v)).addParent(v.bc_code), acc), {})
		return tc_map[code];
	}
	/**
 * 
 * @param {*} capability 
 * @returns {Promise<{system_package : {package_id, alias}, parents_bc : Array<t_object>, tc_package : t_object}>}
 */
	async #getTCRelatedOjbects(capability) {
		/**
		 * @type {{ code, package_id}}
		 */
		const system_package = await Repository.queryOne({ text: APP_CATALOG.APP_PACKAGE_QUERY, values: [capability.targetSystemCode] })
		if (!system_package) throw Object.assign(Error(`Папка системы с кодом ${capability.targetSystemCode} не найдена`), { status: 404 });

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

	async #createTC(capability) {
		const { system_package, parents_bc, tc_package } = await this.#getTCRelatedOjbects(capability)

		const tc = await Repository.createObject({
			alias: capability.code,
			package_id: tc_package.package_id, name: capability.name, object_type: "Class",
			author: "FDM API", alias: capability.code,
			note: capability.description,
			scope: 'Public', parentid: '0', classifier: '0', pdata4: '0',
			stereotype: TechnicalCapability.STEREOTYPE,
			backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1, status: "Created"
		});

		await Repository.insert(t_xref, t_xref.ArchimateElementStereotype({ guid: tc.ea_guid, stereotype: TechnicalCapability.STEREOTYPE }));

		tc.code = tc.alias;
		tc.description = tc.note;

		for (let bc of Object.values(parents_bc)) {
			await this.addParentBC(tc, bc);
		}

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
		let ea_capability = await Repository.first(t_object, { alias: code });

		if (!ea_capability) {
			return this.#createTC(capability);
		}


		if (ea_capability.name !== capability.name || ea_capability.note !== capability.description) {
			await Repository.update(t_object, { name: capability.name, note: capability.description }, { object_id: ea_capability.object_id })
		}

		const asis_tc = await this.getTechnicalCapability({ code: code });
		if( !asis_tc){
			let parents_bc = (await Repository.queryRows('select distinct object_id from t_object where alias = ANY($1)', [capability.parents]));
			for (const bc of parents_bc) {
				await this.addParentBC(asis_tc, { object_id: bc.object_id });
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

	async addParentBC(capability, parent) {
		const parent_id = parent.object_id;
		if (!parent_id) throw Error('not implemented');
		const capability_id = capability.object_id;
		if (!capability_id) throw Error('not implemented');
		const bc_package = await Repository.queryOne(TC_QUERY.BC_PACKAGE_QUERY_BY_ID, [parent_id]);
		/** @type {t_diagram} */
		const diagram = await Repository.putDiagram({ package_id: bc_package.package_id, name: TC_QUERY.BC_TC_DIAGRAM_NAME, diagram_type: 'Component', author: 'FDM API' });
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
		const connector = await Repository.putConnector(parent_id, capability_id, CONNECTOR_STEREOTYPES.ARCHIMATE_AGGREGATION);
		await Repository.insert(t_diagramlinks, { diagramid: diagram.diagram_id, connectorid: connector.connector_id, geometry: 'EDGE=3;$LLB=;LLT=;LMT=;LMB=;LRT=;LRB=;IRHS=;ILHS=;' });
	}
}

export default new TechnicalCapabilityService();