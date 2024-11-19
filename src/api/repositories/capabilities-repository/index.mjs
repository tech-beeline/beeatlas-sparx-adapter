import { NotImplemented } from '../../../utils/errors.mjs';
import Repository from '../sparx-ea-repository/index.mjs'
import { SELECT_ALL_BC } from './capability-queries.mjs';
export { BC_PACKAGE_QUERY_BY_ID } from './capability-queries.mjs'



const SELECT_BY_CODE = `${SELECT_ALL_BC} where code=$1`;
const SEARCH_BY_NAME = `${SELECT_ALL_BC} WHERE name LIKE ANY ($1)`
const SELECT_CHILDREN_BY_NAME = `${SELECT_ALL_BC} where parent=$1`;

export class CapabilitiesRepository {
	async selectAll() {
		return Repository.queryRows(SELECT_ALL_BC)
	}

	async searchByName(terms) {
		const termsArray = Array.isArray(terms) ? terms.map(t => `%${t}%`) : [`${terms}`]
		return Repository.queryRows(SEARCH_BY_NAME, [termsArray]);
	}

	/**
	 * 
	 * @param {string} code Код возможности
	 * @returns 
	 */
	async selectByCode(code) {
		return Repository.queryOne(SELECT_BY_CODE, [code]);
	}
	async selectChildren(code) {
		return Repository.queryRows(SELECT_CHILDREN_BY_NAME, [code]);
	}
	async createDomain(parentCode, code, name, description, author, status) {
		NotImplemented();
	}
	async setCapabilityOwner(code, owner) {
		NotImplemented();
	}
}

