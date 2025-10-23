import { NotFound } from "../../../../utils/errors.mjs";
import eaRepository from "../../sparx-ea-repository/ea-repository.mjs";
import { CONTAINERS_SUBPACKAGE_NAME, INTERFACES_SUBPACKAGE_NAME, TC_SUBPACKAGE_NAME } from "../const.mjs";
import { SystemDTOInternal } from "../model.mjs";
import { selectAllInterfaces, selectAppInterfaces } from "./select-interfaces.mjs";
import { selectAllMethods, selectAppMethods } from "./select-methods.mjs";

class ApplicationDto {
	name;
	/**@type {string} */
	code;
	description;
	status;
	FQName;
	modfidedDate;
	version;
	SELECT_TC_OBJECT_ID;
	sys_package_id;
	c_pkg_id;
	api_pkg_id;
	tc_pkg_id;
}

export const SELECT_SYSTEMS = `WITH RECURSIVE cte_sys_catalog AS (
	SELECT 
		p.package_id, p.parent_id, p.name, p.name::text as "FQName"
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='ApplicationCatalogue'
	UNION
	SELECT c.package_id, p.parent_id, c.name, p."FQName"::text || '/' || c.name
    FROM cte_sys_catalog p
    	JOIN t_package c ON c.parent_id=p.package_id
), cte_tc_cat AS (
	SELECT	p.package_id, p.package_id AS parent_id, p.ea_guid
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='TechCapabilitiesCatalogue'
	UNION
	SELECT c.package_id, p.parent_id, c.ea_guid
		FROM cte_tc_cat p
		JOIN t_package c ON c.parent_id=p.package_id
)
SELECT
		sys.name, 
		sys.alias as code, 
		sys.note as description, 
		sys.status, 
		sys.author,
		c."FQName",
		sys.modifiedDate AS "modifiedDate", 
		sys.version,
		sys.object_id,
		p.package_id AS sys_package_id,
		cp.package_id AS c_pkg_id,
		it.package_id AS api_pkg_id,
		tc.package_id AS tc_pkg_id
	FROM cte_sys_catalog c
		JOIN t_object sys ON sys.package_id=c.package_id
			AND sys.alias IS NOT NULL 
			AND sys.object_type='Component' 
			AND sys.stereotype='softwareSystem'
		LEFT JOIN t_object po ON LOWER(po.alias)=LOWER(sys.alias) AND po.object_type='Package'
		LEFT JOIN cte_tc_cat p ON p.ea_guid=po.ea_guid
		LEFT JOIN t_package cp ON cp.parent_id=p.package_id AND cp.name='Containers'
		LEFT JOIN t_package it ON it.parent_id=p.package_id AND it.name='Interfaces'
		LEFT JOIN t_package tc ON tc.parent_id=p.package_id AND tc.name='TC'`;

/**
 * 
 * @returns {Promise<ApplicationDto[]>}
 */
export const selectApplications = async () => eaRepository.query(SELECT_SYSTEMS);

const selectAppByCode = async (code) => eaRepository.query(`${SELECT_SYSTEMS} WHERE LOWER(sys.alias)=$1`, code.toLowerCase())

export const SELECT_SYSTEM_BY_CODE = `${SELECT_SYSTEMS}
WHERE LOWER(sys.alias)=LOWER($1)`;

export const SELECT_SYSTEM_PACKAGES = `WITH RECURSIVE cte_tc_cat AS (
	SELECT	p.package_id, p.package_id AS parent_id, p.ea_guid
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE o.stereotype='TechCapabilitiesCatalogue'
	UNION
	SELECT c.package_id, p.parent_id, c.ea_guid
		FROM cte_tc_cat p
		JOIN t_package c ON c.parent_id=p.package_id
)
SELECT s.object_id as system_id, 
	s.name, c.package_id, 
	cp.package_id as containers_package_id,
	it.package_id as interfaces_package_id,
	tc.package_id AS tc_package_id,
	coalesce(c.parent_id, (SELECT package_id FROM cte_tc_cat WHERE parent_id=package_id)) as root_id
FROM  t_object s 
	LEFT JOIN t_object o ON LOWER(o.alias)=LOWER($1) AND o.object_type='Package'
	LEFT JOIN cte_tc_cat c ON o.ea_guid=c.ea_guid 
	LEFT JOIN t_package cp ON cp.parent_id=c.package_id AND cp.name='${CONTAINERS_SUBPACKAGE_NAME}'
	LEFT JOIN t_package it ON it.parent_id=c.package_id AND it.name='${INTERFACES_SUBPACKAGE_NAME}'
	LEFT JOIN t_package tc ON tc.parent_id=c.package_id AND tc.name='${TC_SUBPACKAGE_NAME}'
WHERE LOWER(s.alias)=LOWER($1) AND s.stereotype='softwareSystem'`;

export const loadApps = async () => {
	const app_map = {};
	const [app_rows, api_rows, method_rows] = await Promise.all([
		selectApplications(),
		selectAllInterfaces(),
		selectAllMethods()
	]);

	for (const app_row of app_rows) {
		const code = app_row.code.toLowerCase();
		const app = app_map[code] || (app_map[code] = new SystemDTOInternal(app_row));
		app.containers = {};
	}

	for (const api_row of api_rows) {

		if (!api_row.app_code || !api_row.app_code.length) {
			console.warn(`Не указан app_code`, api_row);
			continue;
		}
		const app_code = api_row.app_code.toLowerCase();

		/** @type {SystemDTOInternal} */
		const app = app_map[app_code];
		if (!app) {
			console.warn(`invalid api row ${JSON.stringify(api_row)}`);
			continue;
		}

		if (!api_row.container_code || !api_row.container_code.length) {
			console.warn(`Не указан container_code`, api_row);
			continue;
		}
		const container = app.containers[api_row.container_code.toLowerCase()] ??
			(app.containers[api_row.container_code.toLowerCase()] = { ...api_row });

		if (container.container_id != api_row.container_id) {
			const doubles = container.doubles ?? (container.doubles = []);
			if (doubles.find(d => d == api_row.container_id))
				continue;
			doubles.push(api_row.container_id);
		}

		if (!container.interfaces) container.interfaces = {};

		if (!api_row.interface_code) continue;

		if (container.interfaces[api_row.interface_code.toLowerCase()]) {
			console.warn(`Дубль интерфейса ${api_row.interface_code}`);
			if (!container.interfaces[api_row.interface_code.toLowerCase()].doubles) {
				container.interfaces[api_row.interface_code.toLowerCase()].doubles = [];
			}
			container.interfaces[api_row.interface_code.toLowerCase()].doubles.push(api_row);
		} else {
			container.interfaces[api_row.interface_code.toLowerCase()] = api_row;
			api_row.methods = [];
		}
	}
	

	for (const method_row of method_rows) {
		if (!method_row.name) {
			console.warn(`Метод с путым именем`, method_row);
			continue;
		}

		const app = app_map[method_row.app_code.toLowerCase()];
		if (!app) {
			console.warn(`Не найдено приложение для метода`, method_row);
			continue;
		}
		const cn = app.containers[method_row.container_code.toLowerCase()];
		if (!cn) {
			console.warn(`Не найден контейнер для метода`, method_row);
			continue;
		}
		const api = cn.interfaces[method_row.interface_code.toLowerCase()];
		if (!api) {
			console.warn(`Не найден интерфейс для метода`, method_row);
			continue;
		}
		const m = api.methods.find(m => m.name.toLowerCase() == method_row.name.toLowerCase());
		if (m) {
			console.warn(`Найден дубль метода ${m.name}`, method_row, m);
			const doubles = m.doubles ?? (m.doubles = []);
			if (!doubles.find(i => i.operation_guid == method_row.operation_guid)) {
				doubles.push(method_row.operation_guid);
			}
			continue;
		}
		api.methods.push(method_row);
	}

	return Object.values(app_map);
}


export async function loadApp(app) {
	const app_code = app.code.toLowerCase();

	const [api_rows, method_rows] = await Promise.all([
		selectAppInterfaces(app_code),
		selectAppMethods(app_code)
	]);

	const containers = {}

	for (const api_row of api_rows) {

		if (api_row.app_code?.toLowerCase() !== app_code) {
			console.warn(`В запрос для кода ${app_code} вернулась ошибочнавя запись`, api_row);
			continue;
		}
		if (!api_row.container_code || !api_row.container_code.length) {
			console.warn(`Не указан container_code`, api_row);
			continue;
		}

		const container = containers[api_row.container_code.toLowerCase()] ??
			(containers[api_row.container_code.toLowerCase()] = { ...api_row });

		if (!container.interfaces) container.interfaces = {};

		if (!api_row.interface_code || !api_row.interface_code.length) {
			//console.log(`Ну указан код интерфейса. Считаем, что контейнер пустой`, api_row);
			continue;
		}
		if (container.interfaces[api_row.interface_code.toLowerCase()]) {
			console.warn(`Дубль интерфейса ${api_row.code}`);
		} else {
			container.interfaces[api_row.interface_code.toLowerCase()] = api_row;
			api_row.methods = [];
		}
	}

	for (const method_row of method_rows) {
		if (!method_row.name) {
			console.warn(`Метод с путым именем`, method_row);
			continue;
		}

		const cn = containers[method_row.container_code.toLowerCase()];
		if (!cn) {
			console.warn(`Не найден контейнер для метода`, method_row);
			continue;
		}
		const api = cn.interfaces[method_row.interface_code.toLowerCase()];
		if (!api) {
			console.warn(`Не найден интерфейс для метода`, method_row);
			continue;
		}
		const m = api.methods.find(m => m.name.toLowerCase() == method_row.name.toLowerCase());
		if (m) {
			console.warn(`Найден дубль метода ${m.name}`, method_row, m);
			continue;
		}
		api.methods.push(method_row);
	}

	app.containers = containers;
	return app;
}