import { NotImplemented } from '../../../utils/errors.mjs';
import Repository from '../sparx-ea-repository/index.mjs'
import { SELECT_ALL_BC } from './capability-queries.mjs';
import { CapabilitDTO, CapabilitDTOInternal } from './model.mjs';
export { BC_PACKAGE_QUERY_BY_ID } from './capability-queries.mjs'



const SELECT_BY_CODE = `${SELECT_ALL_BC} where code=$1`;
const SEARCH_BY_NAME = `${SELECT_ALL_BC} WHERE name LIKE ANY ($1)`
const SELECT_CHILDREN_BY_NAME = `${SELECT_ALL_BC} where parent=$1`;
const throwCapabilityNotFound = (code) => {
	throw Error(`Capability with code="${code}" not found`);
};
const throwIsNotDomain = (code) => {
	throw Error(`Capability with code="${code}" is not domain`);
}

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
	 * @returns {Promise<CapabilitDTO>}
	 */
	async selectByCode(code) {
		const data = await Repository.queryOne(SELECT_BY_CODE, [code]); // [ ] Добавить проверку на уникальность кода ( alias )
		return data ? new CapabilitDTOInternal(data) : null;
	}
	async selectChildren(code) {
		return Repository.queryRows(SELECT_CHILDREN_BY_NAME, [code]);
	}
	/**
	 * 
	 * @param {string} parentCode 
	 * @param {string} code 
	 * @param {string} name 
	 * @param {string} description 
	 * @param {string} author 
	 * @param {string} status 
	 */
	async createDomain(parentCode, code, name, description, author, status) {
		/** @type {CapabilitDTOInternal} */
		const parentDomain = await this.selectByCode(parentCode);
		if (!parentDomain) {
			throwCapabilityNotFound(parentCode);
		}
		if (!parentDomain.isDomain) {
			throwIsNotDomain(parentCode);
		}

		const newPackage = await Repository.createPackage({
			parent_id: parentDomain.package_id,
			name: name,
			alias: code,
			notes: description,
			status: status,
			author: author
		})
		console.info(`Создан домен ${JSON.stringify(newPackage)}`);
		return this.selectByCode(code);
	}
	async setCapabilityOwner(code, owner) {
		NotImplemented();
	}
}

