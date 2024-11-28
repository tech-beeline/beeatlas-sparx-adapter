import { NotFound, NotImplemented } from '../../../utils/errors.mjs';
import { ARCHIMATE_AGGREGATION, UML_RESPONSIBILITY } from '../sparx-ea-repository/ea-repository.mjs';
import Repository, { ARCHIMATE_CAPABILITY, t_object } from '../sparx-ea-repository/index.mjs'
import { INSERT_DOMAIN_DIAGRAM, SELECT_ALL_BC, SELECT_BC_DOMAIN, SELECT_DIAGRAM_HIERARCHY, SELECT_DOMAIN_DIAGRAM_BY_CODE, SELECT_DOMAIN_DIAGRAM_BY_PACKAGE_ID } from './capability-queries.mjs';
import { CapabilitDTO, CapabilityDTOInternal } from './model.mjs';
import { OwnersCatalogue } from './owners-catalogue.mjs';
export { BC_PACKAGE_QUERY_BY_ID } from './capability-queries.mjs'


const ownersCatalogue = new OwnersCatalogue();

const CAPABILITY_PACKAGE_NAME = "BC";

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
		return data ? new CapabilityDTOInternal(data) : null;
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
		/** @type {CapabilityDTOInternal} */
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

	/**
	 * 
	 * @param {number} package_id 
	 * @returns {Promise<{diagram_id}>}
	 */
	async #prepareDomainDiagram(package_id) {
		const domainDiagram = await Repository.queryOne(SELECT_DOMAIN_DIAGRAM_BY_PACKAGE_ID, [package_id]);
		if (domainDiagram) return domainDiagram;

		return Repository.queryOne(INSERT_DOMAIN_DIAGRAM, [package_id]);
	}



	async createCapability(parentCode, code, name, description, author, status) {
		/** @type {Array<CapabilityDTOInternal>} */
		const domainRows = await Repository.queryRows(SELECT_BC_DOMAIN, [parentCode]);
		if (!domainRows.length) throw Error(`Не удалось получить структуру домена для BC code="${parentCode}"`);

		const domainDiagram = await this.#prepareDomainDiagram(domainRows[0].package_id);

		const diagramTree = {};
		domainRows.forEach(row => {
			diagramTree[row.code] = row;
			const parent = diagramTree[row.parent];
			if (parent) {
				(parent.children = (parent.children ?? {}))[row.code] = row;
			}
		});

		const domain = domainRows.find(row => row.isDomain);

		/** @type {CapabilityDTOInternal} */
		const parentRow = diagramTree[parentCode];
		if (!parentRow) throw Error(`В домене ${domain.code} не найдена возможность с кодом ${parentCode}`);


		const capabilitiesPackage = await Repository.putPackage({ parent_id: domainRows[0].package_id, name: CAPABILITY_PACKAGE_NAME });

		/** @type {t_object} */
		let capabilityRow = await Repository.first(t_object, { package_id: capabilitiesPackage.package_id, alias: code });
		if (capabilityRow
			&& (
				capabilityRow.name !== name
				|| capabilityRow.note !== description
				|| capabilityRow.author !== author
				|| capabilityRow.status !== status)) {
			// Если есть существующая BC в целевой папке
			await Repository.update(t_object, { note: description, name: name, author: author, status: status }, { object_id: capabilityRow.object_id });
		}

		if (!capabilityRow) {
			// Создаем если нет
			capabilityRow = await Repository.createObject({
				package_id: capabilitiesPackage.package_id,
				name: name,
				author: author,
				status: status,
				note: description,
				alias: code,
				object_type: ARCHIMATE_CAPABILITY
			});
		}

		const connector = await Repository.putConnector(parentRow.object_id, capabilityRow.object_id, ARCHIMATE_AGGREGATION);
		
		const capability = new CapabilityDTOInternal({
			name: capabilityRow.name,
			isDomain: false,
			code: capabilityRow.alias,
			author: capabilityRow.author,
			createddate: capabilityRow.createddate,
			modifieddate: capabilityRow.modifieddate,
			status: status,
			parent: parentCode,
			description: description,
			connector_id: connector.connector_id,
			object_id: capabilityRow.object_id,
			package_id: domain.package_id
		});

		(diagramTree[parentCode].children = (diagramTree[parentCode].children ?? {}))[code] = capability;

		console.log(domain);

		NotImplemented();
	}

	async setCapabilityOwner(code, owner) {
		console.info(`Изменение владельца для BC (code="${code}")`);

		const capability = await this.selectByCode(code);
		if (!capability) throw NotFound(`Capability with code=${code} not found`);

		// remove current owners
		if (capability.owner) {
			const currentOwners = await ownersCatalogue.selectByName(capability.owner);
			for (const o of currentOwners) {
				await Repository.removeConnectors(o.object_id, capability.object_id, UML_RESPONSIBILITY);
			}
		}

		if (owner?.length) {
			const actors = await ownersCatalogue.selectByName(owner);

			const actor = actors.length ? actors[0] : (await ownersCatalogue.insertOwner(owner));
			await Repository.putConnector(actor.object_id, capability.object_id, UML_RESPONSIBILITY);
		}
	}
}

