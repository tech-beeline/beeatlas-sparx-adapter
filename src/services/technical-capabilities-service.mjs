import TechnicalCapability from "../model/technical-capability.mjs";
import Repository from "../utils/ea-repo.mjs";
import TECH_CAPABILITY_QUERY from './sql/tech-capabilities.mjs'


const STEREOTYPE_MAP = {
	ArchiMate_Capability: 'BC',
	ArchiMate_TechnicalCapability: ' TC',
	type: (s) => STEREOTYPE_MAP[s] ?? 'Unknown'
}
class TechnicalCapabilityService {
	async getTechnicalCapabilities() {
		const tc_map = (await Repository.queryRows(TECH_CAPABILITY_QUERY.ALL_TECH_CAPABILITITES_QUERY))
			.reduce((acc, v) =>
			(acc[v.code] = acc[v.code] ?? new TechnicalCapability(v), acc[v.code].parents.push(
				{ code: v.bc_code, type: STEREOTYPE_MAP.type(v.parent_stereotype) }), acc), {})

		return Object.values(tc_map);

	}
	async getTechnicalCapability({ code } = {}) {
		const tc_map = (await Repository.queryRows({ text: TECH_CAPABILITY_QUERY.TECH_CAPABILITITY_QUERY, values: [code] }))
			.reduce((acc, v) =>
			(acc[v.code] = acc[v.code] ?? new TechnicalCapability(v), acc[v.code].parents.push(
				{ code: v.bc_code, type: STEREOTYPE_MAP.type(v.parent_stereotype) }), acc), {})
		return tc_map[code];
	}
}

export default new TechnicalCapabilityService();