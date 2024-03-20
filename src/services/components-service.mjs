import System, { APIInterface, Container } from "../model/system.mjs";
import t_connector from "../utils/ea-model/t_connector.mjs";
import t_connectortag from "../utils/ea-model/t_connectortag.mjs";
import t_objectproperties from "../utils/ea-model/t_objectproperties.mjs";
import t_object from "../utils/ea-model/t_object.mjs";
import t_package from "../utils/ea-model/t_package.mjs";
import Repository from "../utils/ea-repo.mjs";
import interfacesService from "./interfaces-service.mjs";
import applicationCatalog from "./sql/application-catalog.mjs";
import SYSTEM_QUERY from "./sql/systems-queries.mjs";




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
class ComponentsService {
	async getComponents() {
		return Repository.queryRows(ALL_COMPONENTS_QUERY);
	}
	#addContainerFromRow(system, row) {
		let container = system.containerByCode(row.container_code) ?? system.addContainer({ name: row.container, code: row.container_code, version: row.container_version });
		if (!row.interface_code)
			return;
		let api = container.interfaceByCode(row.i_code) ?? container.addInterface({ name: row.interface, code: row.interface_code, version: row.interface_version, api_url: row.api_url });
	}
	async getSystemList() {
		let systems = {}
		for (const row of await Repository.queryRows(SYSTEM_QUERY.SYSTEM_REALIZATION_LIST)) {
			/**
			 * @type {System}
			 */
			let system = systems[row.cmdb] = systems[row.cmdb] ?? new System(Object.assign({ name: row.system, code: row.cmdb }, row));
			if (!row.container_code)
				continue;
			this.#addContainerFromRow(system, row);
		}
		return Object.values(systems);
	}

	async getSystem(code) {
		if (!code) throw Object.assign(Error(`system with code ${code} not found`, { status: 404 }));
		/**
		 * @type {System}
		 */
		let system = null;
		for (const row of await Repository.queryRows({ text: SYSTEM_QUERY.SYSTEM_REALIZATION_BY_CODE, values: [code] })) {
			system = system ?? new System({ name: row.system, code: row.cmdb, version: row.sys_version, ...row });
			/**
			 * @type {Container}
			 */
			this.#addContainerFromRow(system, row);
		}
		return system;
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
		/**
		 * @type {t_object}
		 */
		let ea_system = await Repository.find(t_object, { alias: code, object_type: 'Component' }).then(rows => rows.find(r => r));
		if (!ea_system) Object.assign(Error(`system with code ${code} not found`, { status: 404 }));

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
					await Repository.update(t_object, { name: container_to_set.name, stereotype: applicationCatalog.CONTAINER_STEREOTYPE }, { object_id: ea_container.object_id })
				//TODO Добавить обновление других полей
			} else
				ea_container = await Repository.createObject({
					package_id: container_package.package_id, name: container_to_set.name, object_type: "Component", author: "FDM API", alias: container_to_set.code, version: container_to_set.version,
					stereotype: applicationCatalog.CONTAINER_STEREOTYPE,
					backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
				});

			if (!ea_container) {
				throw Error(`failed when update container [${container_to_set.code}]${container_to_set.name}`);
			}
			await Repository.putConnector(ea_system.object_id, ea_container.object_id, 'Realisation');

			//TODO Добавить обновление контейнера в выходных данных

			for (let i_to_set of container_to_set.interfaces) {
				let ea_interface = (await Repository.find(t_object, { package_id: interface_package.package_id, alias: i_to_set.code, object_type: 'Interface' })).find(r => r);
				if (!ea_interface) {
					ea_interface = await Repository.createObject({
						package_id: interface_package.package_id, version: i_to_set.version, name: i_to_set.name, object_type: 'Interface', author: "FDM API", alias: i_to_set.code,
						backcolor: -1, bordercolor: -1, borderwidth: -1, fontcolor: -1
					});
					if (i_to_set.api_url) {
						await Repository.insert(t_objectproperties, { object_id: ea_interface.object_id, value: i_to_set.api_url, property: applicationCatalog.API_SPECIFICATION_URL_TAG })
					}
				} else {
					if (ea_interface.name !== i_to_set.name || ea_interface.version !== i_to_set.version) {
						await Repository.update(t_object, { name: i_to_set.name, version: i_to_set.version }, { object_id: ea_interface.object_id })
					}
					/**
					 * @type {t_objectproperties}
					 */
					const ea_api_url = await Repository.find(t_objectproperties, { object_id: ea_interface.object_id, property: applicationCatalog.API_SPECIFICATION_URL_TAG }).then(rows => rows.find(v => v));
					if (!ea_api_url) {
						if (ea_api_url.value !== i_to_set.api_url) {
							if (i_to_set.api_url)
								await Repository.update(t_objectproperties, { value: i_to_set.api_url }, { object_id: ea_interface.object_id, property: applicationCatalog.API_SPECIFICATION_URL_TAG })
							//throw Error('update api_url not implemented')
						}
					} else {
						await Repository.insert(t_objectproperties, { object_id: ea_interface.object_id, value: i_to_set.api_url, property: applicationCatalog.API_SPECIFICATION_URL_TAG })
					}
				}

				await interfacesService.putMethods(i_to_set.code, i_to_set.methods);

				await Repository.putConnector(ea_container.object_id, ea_interface.object_id, 'Realisation');

				let ea_tc = await Repository.objectByAlias(i_to_set.capabilityCode)
				if (!ea_tc) {
					throw Object.assign(Error(`TC с кодом ${i_to_set.capabilityCode} не найден`), { status: 406 });
				}
				await Repository.putConnector(ea_interface.object_id, ea_tc.object_id, 'Realisation');
			}
		}
		return;// TODO Подумать, надо ли возвращать обновленные данные, например, для передачи идентификаторов (ea_guid)
	}
}

export default new ComponentsService();