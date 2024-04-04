import TechnicalCapability from "../model/technical-capability.mjs";
import t_object from "../utils/ea-model/t_object.mjs";
import t_package from "../utils/ea-model/t_package.mjs";
import Repository from "../utils/ea-repo.mjs";
import APP_CATALOG from "./sql/application-catalog.mjs";
import TC_QUERY from './sql/tech-capabilities.mjs'


const STEREOTYPE_MAP = {
	ArchiMate_Capability: 'BC',
	ArchiMate_TechnicalCapability: ' TC',
	type: (s) => STEREOTYPE_MAP[s] ?? 'Unknown'
}

class TechnicalCapabilityService {
	async getTechnicalCapabilities() {
		const tc_map = (await Repository.queryRows(TC_QUERY.ALL_TECH_CAPABILITITES_QUERY))
			.reduce((acc, v) =>
				(acc[v.code] = acc[v.code] ?? new TechnicalCapability(v), acc), {})

		return Object.values(tc_map);

	}
	async getTechnicalCapability({ code } = {}) {
		return Repository.queryOne({ text: TC_QUERY.TECH_CAPABILITITY_QUERY, values: [code] }).then(v => new TechnicalCapability(v));
	}
	/**
	 * 
	 * @param {TechnicalCapability} capability 
	 */
	async postTechnicalCapability(capability) {
		/**
		 * @type {{ code, package_id}}
		 */
		const system_package = await Repository.queryOne({ text: APP_CATALOG.APP_PACKAGE_QUERY, values: [capability.targetSystemCode] })
		if (!system_package) throw Object.assign(Error(`Папка системы с кодом ${capability.targetSystemCode} не найдена`), { status: 404 });

		let tc_package = await Repository.putPackage({ parent_id: system_package.package_id, name: TC_QUERY.TC_PACKAGE_NAME });

		const tc = await Repository.createObject({
			package_id: tc_package.package_id, name: capability.name, object_type: "Class",
			author: "FDM API", alias: capability.code,
			note: capability.description,
			stereotype: TechnicalCapability.STEREOTYPE,
			backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
		});

		tc.code = tc.alias;
		tc.createdDate = tc.createddate;
		tc.modifiedDate = tc.modifieddate;
		tc.description = tc.note;
		
		return new TechnicalCapability(tc);
	}
}

export default new TechnicalCapabilityService();