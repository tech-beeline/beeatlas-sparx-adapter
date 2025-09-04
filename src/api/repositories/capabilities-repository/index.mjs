import {
	BadRequest,
	NotFound,
	NotImplemented
} from '../../../utils/errors.mjs';
import { KeyValueCache } from '../key-value-cache/index.mjs';
import {
	ARCHIMATE_AGGREGATION,
	UML_RESPONSIBILITY
} from '../sparx-ea-repository/ea-repository.mjs';
import Repository, {
	ARCHIMATE_CAPABILITY,
	t_connector,
	t_object,
	t_package
} from '../sparx-ea-repository/index.mjs'

import { INSERT_DIAGRAM_LINK, INSERT_DIAGRAM_OBJECTS, INSERT_DOMAIN_DIAGRAM, SELECT_ALL_BC, SELECT_BC_DOMAIN, SELECT_DIAGRAM_HIERARCHY, SELECT_DOMAIN_BY_CODE, SELECT_DOMAIN_DIAGRAM_BY_CODE, SELECT_DOMAIN_DIAGRAM_BY_PACKAGE_ID } from './capability-queries.mjs';
import { loadDomainStructure } from './domain-structure.mjs';
import { CapabilityDTO, CapabilityDTOInternal } from './model.mjs';
import { OwnersCatalogue } from './owners-catalogue.mjs';
export { BC_PACKAGE_QUERY_BY_ID } from './capability-queries.mjs';
export { bcRepository } from './bc-repoository.mjs';
export { domainsRepositoryInstance } from './domains-repository.mjs';

const ownersCatalogue = new OwnersCatalogue();

const CAPABILITY_PACKAGE_NAME = "BC";

const SELECT_BY_CODE = `${SELECT_ALL_BC} AND lower(bc.code)=LOWER($1)`;
const SELECT_BY_CODE_LIST = `${SELECT_ALL_BC} AND LOWER(bc.code)=ANY($1)`;

const SEARCH_BY_NAME = `${SELECT_ALL_BC} AND name LIKE ANY ($1)`
const SELECT_CHILDREN_BY_NAME = `${SELECT_ALL_BC} AND lower(bc.parent_code)=$1`;

const throwCapabilityNotFound = (code) => {
	throw Error(`Capability with code="${code}" not found`);
};
const throwIsNotDomain = (code) => {
	throw Error(`Capability with code="${code}" is not domain`);
}

export class CapabilitiesRepository {

	#cache = new KeyValueCache({
		key: "code",
		loadFn: () => Repository.queryRows(SELECT_ALL_BC),
		entity: "capability"
	});
	/**
	  * @returns {Promise<Array<{code, name, isDomain, description, createdDate, parent,status, author, version,owner}>>}
	  */
	async selectAll() {
		return this.#cache.all();
	}

	async searchByName(terms) {
		const termsArray = Array.isArray(terms) ? terms.map(t => `%${t}%`) : [`${terms}`]
		return Repository.queryRows(SEARCH_BY_NAME, [termsArray]);
	}

	/**
	 * 
	 * @param {string} code Код возможности
	 * @returns {Promise<CapabilityDTO>}
	 */
	async selectByCode(code) {
		return this.#cache.byKey(code);
	}

	/**
	 * 
	 * @param {Array<string>} codes 
	 * @returns 
	 */
	async selectCapabilityList(codes) {
		const rows = await Repository.queryRows(SELECT_BY_CODE_LIST, [codes.map(c => c.toLowerCase())]);
		return rows.map(r => new CapabilityDTOInternal(r));
	}
	/**
	 * 
	 * @param {string} code 
	 * @returns 
	 */
	async selectChildren(code) {
		return Repository.queryRows(SELECT_CHILDREN_BY_NAME, [code.toLowerCase()]);
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
		/** @type {CapabilityDTOInternal[]} */
		const parentDomain = await Repository.query(SELECT_DOMAIN_BY_CODE, parentCode);
		if (!parentDomain.length) {
			throwCapabilityNotFound(parentCode);
		}
		if (parentDomain.length > 1)
			throw Error(`Найдено более одного домена с кодом ${parentCode}`);

		const newPackage = await Repository.createPackage({
			parent_id: parentDomain[0].package_id,
			name: name,
			alias: code,
			notes: description,
			status: status,
			author: author
		})
		console.info(`Создан домен ${JSON.stringify(newPackage)}`);

		return this.#cache.updateValue(code, new CapabilityDTO({
			name: newPackage.name,
			isDomain: true,
			code: code,
			author: author,
			createdDate: newPackage.createddate,
			modifiedDate: newPackage.modifieddate,
			status: status,
			parent: parentCode,
			description, description
		}));
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


	calcPosition(capability, left = 0, level = 0) {
		capability.top = level * (DEFAULT_ELEMENT_HEIGHT + LEVEL_OFFSET) + LEVEL_OFFSET;
		capability.bottom = capability.top + DEFAULT_ELEMENT_HEIGHT;

		if (!capability.children) {
			capability.left = capability.childrenLeft = left;
			capability.right = capability.childrenRight = (left + DEFAULT_ELEMENT_WIDTH);

			return capability.childrenRight;
		}
		const children = Object.values(capability.children);

		let l = left;
		for (const child of children) {
			const r = this.calcPosition(child, l, level + 1);
			l = r + X__OFFSET;
		}
		capability.left = Math.floor((l - X__OFFSET - DEFAULT_ELEMENT_WIDTH + left) / 2);
		capability.right = capability.left + DEFAULT_ELEMENT_WIDTH;
		return l - X__OFFSET;
	}

	/**
	 * 
	 * @param {string} parentCode 
	 * @param {string} code 
	 * @param {string} name 
	 * @param {string} description 
	 * @param {*} author 
	 * @param {*} status 
	 * @returns 
	 */
	async createCapability(parentCode, code, name, description, author, status) {
		const domainStructure = await loadDomainStructure(parentCode);
		const domain = domainStructure.domain;

		/** @type {CapabilityDTOInternal} */
		const parentCapability = domainStructure.member(parentCode);
		if (!parentCapability) throw Error(`В домене ${domain.code} не найдена возможность с кодом ${parentCode}`);

		const domainCapabilitiesPackage = await Repository.putPackage({ parent_id: domain.package_id, name: CAPABILITY_PACKAGE_NAME });

		const capabilityRow = await Repository.createObject({
			package_id: domainCapabilitiesPackage.package_id,
			name: name,
			author: author,
			status: status,
			note: description,
			alias: code,
			object_type: ARCHIMATE_CAPABILITY
		});

		const connector = await Repository.putConnector(parentCapability.object_id, capabilityRow.object_id, ARCHIMATE_AGGREGATION);

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

		domainStructure.addMember(capability);
		await domainStructure.arrange();

		return this.#cache.updateValue(code, capability);
	}

	/**
	 * 
	 * @param {*} code 
	 * @returns {Promise<t_package>}
	 */
	async getDomain(code) {
		const pkg = await Repository.query(`SELECT * from t_package WHERE LOWER(alias)=LOWER($1)`, code);
		if (!pkg.length)
			throw Error(`Не найждена папка с кодом ${current_capability.parent}`);
		if (pkg.length > 1)
			throw Error(`найдено больше одной папки с кодом ${current_capability.parent}`);
		return pkg[0];
	}

	async updateCapability(parentCode, code, isDomain, name, description, author, status) {
		const current_capability = await this.selectByCode(code);
		if (!current_capability)
			throw Error(`Не найдена возможность с кодом ${code}`);

		if (current_capability.name == name
			&& current_capability.description == description
			&& current_capability.author == author
			&& current_capability.status == status
			&& current_capability.parent.toLowerCase() == parentCode.toLowerCase()) {
			return current_capability;
		}

		const updated = await Repository.update(
			t_object,
			{
				name: name,
				note: description,
				status: status,
				author: author
			},
			{ object_id: current_capability.object_id });

		if (updated.length) {
			if (isDomain)
				await Repository.update(
					t_package,
					{ name: name, notes: description },
					{ ea_guid: updated[0].ea_guid });
		}

		if (current_capability.parent.toLowerCase() != parentCode.toLowerCase()) {
			if (isDomain) {
				const parent_package = await this.getDomain(parentCode);
				const pkg = await this.getDomain(code);
				await Repository.update(t_package, { parent_id: parent_package.package_id }, { package_id: pkg.package_id });
				await Repository.update(t_object, { package_id: parent_package.package_id }, { ea_guid: pkg.ea_guid });
				current_capability.parent = parentCode;
				return this.#cache.updateValue(code, current_capability);
			}


			const domainStructure = await loadDomainStructure(parentCode);
			const domain = domainStructure.domain;

			/** @type {CapabilityDTOInternal} */
			const parentCapability = domainStructure.member(parentCode);
			if (!parentCapability) throw Error(`В домене ${domain.code} не найдена возможность с кодом ${parentCode}`);

			const domainCapabilitiesPackage = await Repository.putPackage({ parent_id: domain.package_id, name: CAPABILITY_PACKAGE_NAME });

			const capabilityRow = await Repository.update(
				t_object,
				{
					package_id: domainCapabilitiesPackage.package_id
				},
				{
					object_id: current_capability.object_id
				}
			);

			await Repository.query('DELETE t_diagramlinks WHERE connectorid');
			await Repository.delete(t_connector, { end_object_id: current_capability.object_id });

			NotImplemented();
		}
	}


	async upsertCapability(parentCode, isDomain, code, name, description, author, status) {
		const currentCapability = await this.selectByCode(code);

		if (currentCapability) {
			if (currentCapability.author === author
				&& currentCapability.isDomain === isDomain
				&& currentCapability.parent === parentCode
				&& currentCapability.name === name
				&& currentCapability.description === description
				&& currentCapability.status == status
				&& currentCapability.parent.toLowerCase() === parentCode.toLowerCase()
			) {
				return currentCapability;
			}
			if (isDomain !== currentCapability.isDomain) throw BadRequest('Смена типа возможности не предусмотрена');
			if (isDomain) {
				const objects = await Repository.update(t_object, {
					name: name,
					note: description,
					author: author,
					status: status
				}, { alias: currentCapability.code, object_type: 'Package' });

				if (currentCapability.name !== name
					|| currentCapability.description !== description
					|| currentCapability.parent.toLowerCase() !== parentCode.toLowerCase()) {

					const domainData = { name: name, notes: description };

					if (currentCapability.parent.toLowerCase() !== parentCode.toLowerCase()) {
						throw NotImplemented('Смена родительского домена для домена отключена');
						const parent = await Repository.getPackageByAlias(parentCode);
						if (!parent) throw BadRequest('РОдительский домен не найден');
						domainData.parent_id = parent.package_id;
					}

					for (const obj of objects) {
						await Repository.update(t_package, domainData, { ea_guid: obj.ea_guid });
					}
				}
				return this.selectByCode(code);
			}
			await Repository.update(t_object, {
				name: name,
				note: description,
				author: author,
				status: status
			}, { alias: currentCapability.code, object_type: 'Class', stereotype: ARCHIMATE_CAPABILITY });
		}
		return isDomain ?
			this.createDomain(parentCode, code, name, description, author, status)
			: this.createCapability(parentCode, code, name, description, author, status);
	}

	async setCapabilityOwner(code, owner) {

		const capability = await this.selectByCode(code);
		if (!capability) throw NotFound(`Capability with code=${code} not found`);
		if (capability.owner?.toLowerCase() === owner.toLowerCase())
			return;

		console.info(`Изменение владельца для BC (code="${code}")`);

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

export const capabilityRepositoryInstance = new CapabilitiesRepository();