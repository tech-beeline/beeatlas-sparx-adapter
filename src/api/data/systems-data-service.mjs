import Repository from '../../utils/ea-repo.mjs'
import { APP_CATALOG_ROOT } from '../../resources/const.mjs';

const CTE_SYSTEM_CATALOG = `cte_sys_catalog AS (
    SELECT package_id, package_id AS parent_id, name , name::text AS "FQName", ea_guid
        FROM t_package WHERE ea_guid='${APP_CATALOG_ROOT}'
    UNION DISTINCT
    SELECT c.package_id, p.parent_id, c.name, p."FQName"::text || '/' || c.name, c.ea_guid
            FROM cte_sys_catalog p
            JOIN t_package c ON c.parent_id=p.package_id
)`;

const CTE_SYSTEMS = `${CTE_SYSTEM_CATALOG}, 
cte_systems AS (
    SELECT sys.object_id, sys.name as system, sys.ea_guid, sys.alias AS sys_code, sys.note AS sys_description, sys.author, sys.status, sys.modifiedDate AS "modifiedDate", sys.version,
		cat."FQName" || '/' || sys.name AS "FQName", cat.name AS "packageName"
		FROM cte_sys_catalog cat
		JOIN t_object sys ON sys.package_id=cat.package_id AND sys.object_type='Component' AND sys.alias is not null AND sys.stereotype IS null)
`;

const CTE_REALIZATION = `cte_realization AS ( select 
    DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation')`

const SELECT_ONLY_SYSTEMS = `WITH RECURSIVE ${CTE_SYSTEMS}
SELECT * FROM cte_systems`

const SELECT_ALL = `WITH RECURSIVE ${CTE_SYSTEMS},
${CTE_REALIZATION}
SELECT sys.*, 
	c.name AS container,c.alias AS container_code, c.version as container_version, c.note as container_description, c.object_id as container_id,
	it.name as interface, it.alias as interface_code, it.version as interface_version, it.note as interface_description, it.object_id as interface_id
FROM cte_systems sys
	LEFT JOIN cte_realization c ON c.start_object_id=sys.object_id AND c.object_type='Component' AND c.alias is not null and c.stereotype='C2'
	LEFT JOIN cte_realization it ON it.start_object_id=c.object_id AND it.object_type='Interface' AND it.alias is not null AND it.alias <> ''`


const SELECT_SYSTEM_CAPABILITIES = `WITH RECURSIVE cte_sys AS(
	SELECT object_id
	FROM t_object sys
	WHERE sys.alias=$1 and sys.object_type='Component'
),
cte_sys_pack AS( 
	SELECT
		tcp.package_id
	FROM t_object ro 
		JOIN t_package rp ON rp.ea_guid=ro.ea_guid
		JOIN t_package tcp ON tcp.parent_id=rp.package_id
	WHERE ro.alias=$1 AND object_type='Package'
	UNION ALL
	SELECT c.package_id
	FROM cte_sys_pack p
		JOIN t_package c ON c.parent_id=p.package_id 
),
cte_realization AS ( 
	SELECT DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation'),
cte_tc as (
	SELECT DISTINCT
		tc.name, tc.object_id, tc.alias, tc.stereotype
	FROM cte_sys sys
		JOIN t_connector irel ON irel.start_object_id=sys.object_id
		JOIN t_object it ON it.object_id=irel.end_object_id AND it.object_type='Interface'
		JOIN t_connector srel ON srel.start_object_id=it.object_id
		JOIN t_object sr ON sr.object_id=srel.end_object_id
		JOIN t_connector tcr ON tcr.start_object_id=sr.object_id
		JOIN t_object tc ON tc.object_id=tcr.end_object_id AND tc.stereotype='ArchiMate_TechnicalCapability'
	UNION DISTINCT
	SELECT tc.name, tc.object_id, tc.alias as code, tc.stereotype
	FROM cte_sys sys
		JOIN cte_realization c ON c.start_object_id=sys.object_id AND c.object_type='Component' AND c.alias is not null and c.stereotype='C2'
		JOIN cte_realization it ON it.start_object_id=c.object_id AND it.object_type='Interface' AND it.alias is not null AND it.alias <> ''
		JOIN cte_realization tc ON tc.start_object_id=it.object_id AND tc.stereotype='ArchiMate_TechnicalCapability' AND tc.alias is not null AND tc.alias <> ''
	UNION DISTINCT
	SELECT tc.name, tc.object_id, tc.alias, tc.stereotype
	FROM cte_sys_pack p
		JOIN t_object tc ON tc.package_id=p.package_id AND tc.stereotype='ArchiMate_TechnicalCapability' AND tc.alias is not null AND tc.alias <> ''
),
cte_aggregation as (
	SELECT  
		c.object_id as child_id, p.object_id as parent_id
	FROM  t_object c
		JOIN t_package cp ON cp.ea_guid=c.ea_guid
		JOIN t_package pp on pp.package_id=cp.parent_id
		JOIN t_object p ON p.ea_guid=pp.ea_guid AND p.alias is not null
	WHERE c.alias like 'DMN%' or c.alias like 'GRP%'
	UNION
	SELECT end_object_id, start_object_id
	FROM t_connector
	WHERE stereotype='ArchiMate_Aggregation'
),
cte_capability AS (
	SELECT tc.name as name, tc.object_id, tc.object_id as tc_id, tc.object_id as child_id, tc.alias as code, tc.stereotype--, tc.name::text as context
	FROM cte_tc tc 
	UNION DISTINCT
	SELECT bc.name, bc.object_id, ch.tc_id, ch.object_id, bc.alias, coalesce( bc.stereotype, bc.object_type )--, ch.context || '/' || bc.name
	FROM cte_capability ch
		JOIN cte_aggregation rel ON rel.child_id=ch.object_id 
		JOIN t_object bc ON bc.object_id=rel.parent_id AND (bc.stereotype='ArchiMate_Capability' OR bc.object_type='Package')
)
SELECT distinct name, code, object_id, child_id,stereotype FROM cte_capability`;
/*
const SYSTEM_REALIZATION_LIST = `with recursive app_catalog as (
    select package_id, package_id as parent_id, name , name::text as "fullName", ea_guid
        from t_package where ea_guid='${applicationCatalog.APP_CATALOG_ROOT}'
    union distinct
    select c.package_id, p.parent_id, c.name, p."fullName"::text || '/' || c.name, c.ea_guid
        from app_catalog p
        join t_package c on c.parent_id=p.package_id
), rel as ( select 
    distinct r.start_object_id, c.*
    from t_connector r 
        join t_object c on c.object_id=r.end_object_id
    where r.connector_type='Realisation'
)
select 
cat.ea_guid as pguid, cat.name as "packageName", cat."fullName" || '/' || app.name as "fullName", app.author, app.modifiedDate as "modifiedDate",   app.status,
app.name as system, app.alias as cmdb, app.version as sys_version, app.note as sys_description, app.ea_guid,
container.name as container, container.alias as container_code, container.version as container_version, container.note as container_description,
i.name as interface, i.alias as interface_code, i.version as interface_version, i.note as interface_description, i.object_id as i_id,
(select api_url.value from t_objectproperties api_url where api_url.object_id=i.object_id and api_url.property='${API_SPECIFICATION_URL_TAG}' limit 1) as ${API_SPECIFICATION_URL_TAG},
(select api_url.value from t_objectproperties api_url where api_url.object_id=i.object_id and api_url.property='${PROTOCOL_TAG}' limit 1) as ${PROTOCOL_TAG},
(select alias from rel tc where tc.start_object_id=i.object_id and tc.stereotype='ArchiMate_TechnicalCapability' limit 1) as "capabilityCode"
from app_catalog cat
join t_object app on app.package_id=cat.package_id and object_type='Component' and alias is not null and stereotype is null
left join rel container on container.start_object_id=app.object_id and container.object_type='Component' and container.alias is not null and container.stereotype='${applicationCatalog.CONTAINER_STEREOTYPE}'
    left join rel i on i.start_object_id=container.object_id and i.object_type='Interface' and i.alias is not null and i.alias <> ''
`;
const SYSTEM_REALIZATION_BY_CODE = `${SYSTEM_REALIZATION_LIST}
where app.alias=$1`
*/


class SystemsDataService {
    /**
     * 
     * @returns {Promise}
     */
    async selectOnlySystems() {
        return Repository.queryRows(SELECT_ONLY_SYSTEMS);
    }
    /**
     * 
     * @returns {Promise}
     */
    async selectOnlySystemByCode(code) {
        return Repository.queryOne(`${SELECT_ONLY_SYSTEMS} WHERE sys_code=$1`, [code]);
    }
    /**
     * 
     * @returns {Promise}
     */
    async selectSystems() {
        return Repository.queryRows(SELECT_ALL);
    }
    /**
     * 
     * @returns {Promise}
     */
    async selectSystemByCode(code) {
        return Repository.queryRows(`${SELECT_ALL} WHERE sys_code=$1`, [code]);
    }
    /**
     * 
     * @returns {Promise}
     */
    async selectSystemCapabilities(code) {
        return Repository.queryRows(SELECT_SYSTEM_CAPABILITIES, [code]);
    }
}


export default new SystemsDataService();