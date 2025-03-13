import System, { APIInterface, APIMethod, Container } from "../../api/model/system.mjs";
import Repository, {
	t_object
} from "../../api/repositories/sparx-ea-repository/index.mjs";

import interfacesService from "./interfaces-service.mjs";
import applicationCatalog, { API_SPECIFICATION_URL_TAG, PROTOCOL_TAG } from "./sql/application-catalog.mjs";
import SYSTEM_QUERY from "./sql/systems-queries.mjs";
import { BadRequest, NotFound, NotImplemented } from "../../utils/errors.mjs";
import systemParticipation from "./sql/system-participation.mjs";
import { ERROR_RATE_THRESHOLD_TAG, LATENCY_THRESHOLD_TAG, RPS_THRESHOLD_TAG } from "./sql/interfaces-queries.mjs";
import { SystemService } from "../../api/services/index.mjs";


const INTERFACE_TAGS = [PROTOCOL_TAG, API_SPECIFICATION_URL_TAG]

const ALL_COMPONENTS_QUERY =
	`with recursive packages as 
(
	select package_id as id, ea_guid, name, name::text as "fullName"
		from t_package 
		where ea_guid='{7889FE97-8783-4311-B229-3A88F8EFA8E3}'
	union
	select cp.package_id, cp.ea_guid, cp.name, p."fullName"::text || '/' || cp.name::text
		from packages p
		join t_package cp on cp.parent_id=p.id
)
select p.ea_guid as pguid, c.ea_guid, p.name as package, c.name, p."fullName" || '/' || c.name as "fullName",
	c.alias as "code", c.note as description, c.author, c.modifieddate as "modifiedDate", c.status
	from packages p
	join t_object c on c.package_id=p.id and c.object_type='Component'`;


const CONSTANTS = {
	CONTAINERS_FOLDER: "Containers",
	INTERFACES_FOLDER: "Interfaces"
}

const actualService = new SystemService();

class ComponentsService {

	async getComponents() {
		return Repository.queryRows(ALL_COMPONENTS_QUERY);
	}

	async getSystemList() {
		return actualService.getAll();
	}

	async getSystem(code, { loadMethods } = {}) {
		return actualService.getByCode(code, { level: loadMethods ? "methods" : "systems" })
	}

	async getSystemProcesses(cmdb) {

		return Repository.queryRows(systemParticipation, [cmdb])

	}
	/**
	 * 
	 * @param {String} code 
	 * @param {System} system 
	 */
	async putSystem(code, system) {
		if (!code) throw Object.assign(Error(`code is null`, { status: 406 }));
		if (!system) throw Object.assign(Error(`System is null`, { status: 406 }));
		if (system.code !== code) throw Object.assign(Error(`System code ${system.code} != ${code}`, { status: 406 }));
		if (system.containers?.some(c => !c.code)) throw BadRequest(`Не у всех контейнеров заданы коды`);
		if (system.containers?.some(c => c.interfaces?.some(i => !i.code))) throw BadRequest(`Не у всех интерфесов заданы коды`);
		/**
		 * @type {t_object}
		 */
		let ea_system = await Repository.first(t_object, { alias: code, object_type: 'Component' });

		if (!ea_system) throw Object.assign(Error(`system with code ${code} not found`, { status: 404 }));

		const system_package_id = ea_system.package_id;
		let container_package = await Repository.putPackage({ parent_id: system_package_id, name: CONSTANTS.CONTAINERS_FOLDER });
		let interface_package = await Repository.putPackage({ parent_id: system_package_id, name: CONSTANTS.INTERFACES_FOLDER });

		for (let container_to_set of system.containers) {
			/**
			 * @type {t_object}
			 */
			let ea_container = await Repository.objectByAlias(container_to_set.code);
			if (ea_container) {
				if (ea_container.name !== container_to_set.name)
					await Repository.update(t_object, {
						name: container_to_set.name, stereotype: applicationCatalog.CONTAINER_STEREOTYPE,
						note: container_to_set.description
					}, { object_id: ea_container.object_id })
				//[x] Добавить обновление других полей
			} else
				ea_container = await Repository.createObject({
					package_id: container_package.package_id, name: container_to_set.name, object_type: "Component", author: "FDM API", alias: container_to_set.code, version: container_to_set.version,
					note: container_to_set.description,
					stereotype: applicationCatalog.CONTAINER_STEREOTYPE,
					backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
				});

			if (!ea_container) {
				throw Error(`failed when update container [${container_to_set.code}]${container_to_set.name}`);
			}
			await Repository.putConnector(ea_system.object_id, ea_container.object_id, 'Realisation');

			//[ ] Добавить обновление контейнера в выходных данных
			//[ ] Удаление интерфейсов - скорее всего надо помечать, как удаленные

			for (let i_to_set of container_to_set.interfaces) {
				/**
				 * @type {t_object}
				 */
				let ea_interface = await Repository.first(t_object, { alias: i_to_set.code, object_type: 'Interface' });
				if (!ea_interface) {
					ea_interface = await Repository.createObject({
						package_id: interface_package.package_id, version: i_to_set.version, name: i_to_set.name, object_type: 'Interface', author: "FDM API", alias: i_to_set.code,
						note: i_to_set.description,
						backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
					});
				} else {
					if (ea_interface.name !== i_to_set.name || ea_interface.version !== i_to_set.version) {
						await Repository.update(t_object, {
							name: i_to_set.name, version: i_to_set.version, note: i_to_set.description
						}, { object_id: ea_interface.object_id })
					}
				}

				await Repository.updateObjectTags(ea_interface.object_id, i_to_set, INTERFACE_TAGS)

				await interfacesService.putMethods(ea_interface.object_id, i_to_set.methods);

				await Repository.putConnector(ea_container.object_id, ea_interface.object_id, 'Realisation');

				let ea_tc = await Repository.objectByAlias(i_to_set.capabilityCode)
				if (!ea_tc) {
					throw Object.assign(Error(`TC с кодом ${i_to_set.capabilityCode} не найден`), { status: 406 });
				}
				await Repository.putConnector(ea_interface.object_id, ea_tc.object_id, 'Realisation');
			}
		}
		return this.getSystem(code, { loadMethods: true });// [ ] Подумать, надо ли возвращать обновленные данные, например, для передачи идентификаторов (ea_guid)
	}
}

export default new ComponentsService();