import {
	SparxRepository,
	t_object,
	t_objectproperties
} from '../sparx-ea-repository/index.mjs';

import { NotFound, NotImplemented } from '../../../utils/errors.mjs';
import { PREPARE_CONTAINERS_PACKAGE } from '../sql/system-container-sql.mjs';
import { SELECT_PROVIDED_API, SELECT_SYSTEM_CAPABILITIES, SELECT_SYSTEM_PARTICIPITION, SELECT_SYSTEM_SUBPACKAGES } from './systems-queries.mjs';
import { SELECT_SYSTEM_CONTAINERS, SELECT_SYSTEM_CONTAINERS_BY_SYS_CODE } from './systems-containers-queries.mjs';
import { SystemDTO, SystemDTOInternal } from './model.mjs';
import { SparxRepositoryPackages as sparxOptions } from '../sparx-ea-repository/options.mjs';
import { CONTAINER_STEREOTYPE, CONTAINERS_SUBPACKAGE_NAME, DEFAULT_STATUS, INTERFACES_SUBPACKAGE_NAME, REMOVED_STATUS, SYSTEM_SUBPACKAGES as SYSTEM_SUBPACKAGES_NAMES } from './const.mjs';
import { SELECT_SYSTEMS, SELECT_SYSTEM_BY_CODE } from './queries/index.mjs';
import { SELECT_SYSTEM_PACKAGES } from './queries/select-systems.mjs';


const Repository = new SparxRepository();

const isContainersEqual = (a, b) => a.name === b.name && a.description === b.description && a.status === b.status && a.version === b.version;

/**
 * Учет систем
 */
export class SystemsRepository {
	/**
	 * Получение информации о системам
	 * @returns {Promise<Array<SystemDTO>>}
	 */
	async selectSystems() {
		return Repository.queryRows(SELECT_SYSTEMS)
			.then(rows => rows.map(r => new SystemDTOInternal(r)));
	}
	/**
	 * 
	 * @returns {Promise<SystemDTO | null>}
	 */
	async selectSystemByCode(code) {
		const rows = await Repository.queryRows(SELECT_SYSTEM_BY_CODE, [code]);
		/* [ ] Изменить обработку множественных записей с одним кодом (несколько папок)
		if (rows.length > 1) {
			throw Error(`Too many system with code="${code}"`);
		}
			*/
		return rows.length ? new SystemDTOInternal(rows[0]) : null;
	}

	async prepareSystemPackages(code) {
		/** @type {{object_id, name:string, package_id, containers_package_id,interfaces_package_id}} */
		let systemPackages = await Repository.queryOne(SELECT_SYSTEM_PACKAGES, [code]);
		if (!systemPackages) throw NotFound(`System with code=[${code}] not found`);

		if (!systemPackages.package_id) {
			console.info(`create system package (code="${code}", name="${systemPackages.name}"):`);
			const option = await sparxOptions.default();
			const pkg = await Repository.createPackage({
				parent_id: option.TechCapabilitiesCatalogue.package_id,
				name: systemPackages.name,
				alias: code
			});
			systemPackages.package_id = pkg.package_id;
		}

		if (!systemPackages.containers_package_id) {
			console.info(`create containers package (code="${code}", name="${systemPackages.name}"):`);

			const containerPackage = await Repository.createPackage({
				parent_id: systemPackages.package_id,
				name: CONTAINERS_SUBPACKAGE_NAME
			});
			systemPackages.containers_package_id = containerPackage.package_id;
		}

		if (!systemPackages.interfaces_package_id) {
			console.info(`create interfaces package (code="${code}", name="${systemPackages.name}"):`);

			const interfacesPackage = await Repository.createPackage({
				parent_id: systemPackages.package_id,
				name: INTERFACES_SUBPACKAGE_NAME
			});
			systemPackages.interfaces_package_id = interfacesPackage.package_id;
		}
		return systemPackages;
	}

	/**
	 * @returns {Promise<Array<{ sys_code, sys_name, code, name, description, version, status}>>}
	 */
	async selectSystemsContainers() {
		return Repository.queryRows(SELECT_SYSTEM_CONTAINERS)
	}

	/**
	 * 
	 * @param {string} systemCode 
	 * @returns {Promise<Array<{sys_code, sys_name, code, name, description,version, status}>>}
	 */
	async selectSystemContainers(systemCode) {
		return Repository.queryRows(SELECT_SYSTEM_CONTAINERS_BY_SYS_CODE, [systemCode])
	}

	async selectContainerByCode(containerCode) {
		return Repository.first(t_object, { stereotype: "C4_Container", alias: containerCode })
			.then(r => r ? {
				code: r.alias,
				name: r.name,
				description: r.note,
				version: r.version
			} : null);
	}

	/**
	 * 
	 * @param {string} code 
	 * @returns {Promise}
	 */
	async selectSystemE2EParticipition(code) {
		return Repository.queryRows(`${SELECT_SYSTEM_PARTICIPITION} WHERE operation IS NOT NULL`, [code]);
	}

	/**
	 * 
	 * @param {string} systemCode 
	 * @returns {Promise<{container_package_id, sys_package_id, sys_object_id}>}
	 */
	async prepareContainerPackage(systemCode) {
		return Repository.queryOne(PREPARE_CONTAINERS_PACKAGE, [CONTAINERS_SUBPACKAGE_NAME, systemCode]);
	}

	async #insertContainer(system_id, containerPackageId, name, code, author, version, description, status) {
		const container = await Repository.createObject({
			package_id: containerPackageId,
			name: name,
			object_type: "Component",
			author: author,
			alias: code,
			version: version,
			note: description,
			status: status,
			stereotype: CONTAINER_STEREOTYPE,
			backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
		});

		await Repository.putConnector(system_id, container.object_id, 'Realisation');

		return { name: container.name, description: container.note, container_id: container.object_id, code: container.alias };
	}

	async setSystemContainers(systemCode, containers) {
		console.log(`${systemCode} - Обновление информации о контейнерах системы`);
		containers = containers ?? [];

		const systemPackages = await this.prepareSystemPackages(systemCode);

		const containersDiffMap = (await this.selectSystemContainers(systemCode)).reduce((cm, c) => ((cm[c.code] = { current: c }), cm), {});
		for (const tc of containers) {
			if (!tc.status) tc.status = DEFAULT_STATUS;
			const containerDiff = containersDiffMap[tc.code] ?? (containersDiffMap[tc.code] = {});
			containerDiff.target = tc;
			containerDiff.needUpdate = containerDiff.current && !isContainersEqual(containerDiff.current, tc);
		}

		// Не удаляем, а устанавливаем статус в удаленный
		Object.values(containersDiffMap).filter(c => !c.target && c.current.status !== REMOVED_STATUS).forEach(diff => {
			diff.target = diff.current;
			diff.target.status = REMOVED_STATUS;
			diff.needUpdate = true;
		});

		/** @type {Array<{current, target, needUpdate}>} */
		const containersToInsert = Object.values(containersDiffMap).filter(c => !c.current);
		const containersToUpdate = Object.values(containersDiffMap).filter(c => c.needUpdate);
		if (!containersToInsert.length && !containersToUpdate.length) {
			console.info(`${systemCode} - Обновление контейнеров не требуется`);
			return;
		}

		if (containersToInsert.length) console.log(`${systemCode} - add new containers:`, containersToInsert.map(c => c.target));

		const newContainers = [];

		for (const diff of containersToInsert) {
			const container = await this.#insertContainer(
				systemPackages.object_id,
				systemPackages.containers_package_id,
				diff.target.name,
				diff.target.code,
				diff.target.author,
				diff.target.version,
				diff.target.description,
				diff.target.status
			);
			newContainers.push(container);
			console.info(`${systemCode} - добавлен контейнер `, container);
		}

		for (const diff of containersToUpdate) {
			await this.updateContainer(
				diff.target.name,
				diff.target.code,
				diff.target.author,
				diff.target.version,
				diff.target.description,
				diff.target.status);

			console.log(`${systemCode} - Обновлен контейнер, status = [${diff.target.status}]`, diff.target)
		}
		console.log(`${systemCode} - Обновление контейнеров завершено`)
	}

	async updateContainer(name, code, author, version, description, status) {
		return Repository.update(t_object,
			{ name: name, author: author, version: version, note: description, status: status },
			{ alias: code, stereotype: "C4_Container" });
	}

	async markContainerRemoved(name, code) {
		return Repository.update(t_object,
			{ name: `[REMOVED!]${name}`, status: "REMOVED" },
			{ alias: code, stereotype: "C4_Container" });
	}

	/**
	 * 
	 * @param {string} systemCode Код приложения
	 * @param {string} tagName 
	 * @returns {Promise<t_objectproperties>}
	 */
	async getSystemTag(systemCode, tagName) {
		const system = await this.selectSystemByCode(systemCode);
		return Repository.first(t_objectproperties, { object_id: system.object_id, property: tagName });
	}

	async setSystemTag(systemCode, tagName, tagValue) {
		const system = await this.selectSystemByCode(systemCode);
		return Repository.updateObjectTags(system.object_id, { [tagName]: tagValue }, [tagName])
	}

	/**
	 * 
	 * @returns {Promise}
	 */
	async selectSystemCapabilities(code) {
		return Repository.queryRows(SELECT_SYSTEM_CAPABILITIES, [code]);
	}

	/**
	 * 
	 * @param {string} systemCode 
	 * @returns {Promise<Array<{name:string,code:string, ea_guid, object_id,method_name:string, method_uid:string,method_description,rps,latency,error_rate}>>}
	 */
	async selectProvidedApi(systemCode) {
		return Repository.query(SELECT_PROVIDED_API, systemCode);
	}

}