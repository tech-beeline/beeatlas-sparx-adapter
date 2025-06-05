import Repository,
{
    t_object,
    t_objectproperties
} from '../sparx-ea-repository/index.mjs';

import { NotFound, NotImplemented } from '../../../utils/errors.mjs';
import { SELECT_API_SOURCES, SELECT_MAPIC_METRIC_TEMPLATE, SELECT_METHOD_ALL_SOURCES, SELECT_METHOD_SOURCES, SELECT_PROVIDED_API_SOURCES, SELECT_SOURCES_PROPERIES } from './methods-sources.mjs';
import { API_METRIC_TEMPLATE_TAG } from '../../const.mjs';
import { SELECT_SYSTEM_CONTAINERS_CODE } from '../systems-repository/systems-containers-queries.mjs';
import { SELECT_INTERFACE_BY_CODE } from '../interfaces-repository/interfaces-queries.mjs';

const SELECT_ALL_SOURCES = `SELECT
src.object_id, src.ea_guid, src.name, t.property, t.value
FROM t_object src
JOIN t_objectproperties t ON t.object_id=src.object_id
WHERE src.stereotype='grafana-source'`;

const SELECT_SOURCE_PROP_BY_UID = `${SELECT_ALL_SOURCES} AND src.ea_guid=$1`


const SELECT_SYSTEM_SOURCE = `SELECT
sys.name as sys_name, src.object_id, src.ea_guid, src.name, t.property, t.value
FROM t_object src
JOIN t_objectproperties t ON t.object_id=src.object_id
JOIN t_connector rel ON rel.start_object_id=src.object_id
JOIN t_object sys ON sys.object_id=rel.end_object_id
WHERE src.stereotype='grafana-source' and sys.alias=$1
	AND sys.stereotype='softwareSystem'
`;

const SELECT_OBJECT_SOURCE = `SELECT
sys.name as sys_name, src.object_id, src.ea_guid, src.name, t.property, t.value
FROM t_object src
JOIN t_objectproperties t ON t.object_id=src.object_id
JOIN t_connector rel ON rel.start_object_id=src.object_id
JOIN t_object sys ON sys.object_id=rel.end_object_id
WHERE src.stereotype='grafana-source' and sys.object_id=$1`;

const SELECT_SOURCE_AND_SYSTEM_IDS = `SELECT
object_id, stereotype, alias as code, ea_guid
FROM t_object
WHERE ea_guid=$2 OR (alias=$1 and stereotype='softwareSystem')`;

const SELECT_SOURCE = `SELECT
name, ea_guid, object_id
FROM t_object
WHERE stereotype='grafana-source' AND ea_guid=$1`

const DELETE_ALL_SOURCE_PROP = `DELETE FROM 
t_objectproperties
WHERE object_id = (SELECT object_id FROM t_object where ea_guid=$1)`;
const SELECT_GRAFANA_PACKAGE_ID = 'SELECT package_id FROM t_package WHERE ea_guid=$1'


const GRAFANA_SOURCE_PACKAGE_UID = process.env.GRAFANA_PACKAGE ?? '{6FE5AA53-C88F-4592-A2BA-80AF9B0BAD59}'


export class MonitoringRepository {

    #grafanaPacakgeID
    async grafanaPackageID() {
        return this.#grafanaPacakgeID ?? (this.#grafanaPacakgeID = await Repository.queryOne(SELECT_GRAFANA_PACKAGE_ID, [GRAFANA_SOURCE_PACKAGE_UID])
            .then(r => r.package_id)
        )
    }
    /**
     * 
     * @returns {Promise<{ object_id:number, name:string, ea_guid:string, property:string, value:string }[]>}
     */
    async selectSourcesProperties() {
        return Repository.queryRows(SELECT_ALL_SOURCES);
    }
    /**
     * 
     * @returns {Promise<{ object_id:number, name:string, ea_guid:string, property:string, value:string }[]>}
     */
    async selectSourcePropertiesByUID(uid) {
        return Repository.queryRows(SELECT_SOURCE_PROP_BY_UID, [uid]);
    }
    async selectSource(uid) {
        return Repository.queryOne(SELECT_SOURCE, [uid]);
    }

    /**
     * 
     * @param {name} name 
     * @returns {Promise<{name, uid}}
     */
    async insertSource(name) {
        const package_id = await this.grafanaPackageID();

        return Repository.createObject({ name: name, object_type: 'Component', stereotype: "grafana-source", package_id: package_id })
            .then(o => ({ name: o.name, uid: o.ea_guid }));
    }
    /**
     * 
     * @param {string} uid 
     * @param {Array} propertyNames 
     * 
     * @returns {Promise}
     */
    async deleteSourceProperties(uid, propertyNames) {
        if (propertyNames) NotImplemented();
        return Repository.queryRows(DELETE_ALL_SOURCE_PROP, [uid]);
    }

    async insertSourceProperties(uid, properties = []) {
        const source = await this.selectSource(uid);
        for (const property of properties) {
            await Repository.insert(t_objectproperties, { object_id: source.object_id, property: property.property, value: property.value })
        }
    }
    /**
     * 
     * @returns {Promise<{ object_id:number, name:string, ea_guid:string, property:string, value:string }[]>}
     */
    async selectSystemSource(systemCode) {
        return Repository.queryRows(SELECT_SYSTEM_SOURCE, [systemCode]);
    }

    /**
     * 
     * @returns {Promise<{ object_id:number, name:string, ea_guid:string, property:string, value:string }[]>}
     */
    async selectObjectSource(object_id) {
        return Repository.queryRows(SELECT_OBJECT_SOURCE, [object_id]);
    }

    /**
     * 
     * @param {string} systemCode Код системы
     * @param {string} sourceUID Идентификатор источника метрик
     * @returns {Promise<{system_id, source_id}>}
     */
    async selectSystemAndSourceIds(systemCode, sourceUID) {
        const ids = await Repository.queryRows(SELECT_SOURCE_AND_SYSTEM_IDS, [systemCode, sourceUID]);
        const system_id = ids.find(s => s.code === systemCode)?.object_id;
        if (!system_id) throw NotFound(`System with code ${systemCode} not found`);
        const source_id = ids.find(s => s.ea_guid === sourceUID)?.object_id;
        if (!source_id) throw NotFound(`Source with uid = ${sourceUID} not found`);
        return { system_id: system_id, source_id: source_id };
    }

    async setSystemSourceLink(systemCode, sourceUID) {
        const { system_id, source_id } = await this.selectSystemAndSourceIds(systemCode, sourceUID);

        return Repository.putConnector(source_id, system_id, 'Realisation');
    }

    async setObjectSourceLink(object_id, sourceUID) {
        const src = await this.selectSource(sourceUID);

        return Repository.putConnector(src.object_id, object_id, 'Realisation');
    }

    async removeSystemSourceLink(systemCode, sourceUID) {
        const { system_id, source_id } = await this.selectSystemAndSourceIds(systemCode, sourceUID);
        return Repository.removeConnectors(source_id, system_id, 'Realisation');
    }

    async removeObjectSourceLink(object_id, sourceUID) {
        const src = await this.selectSource(sourceUID);
        return Repository.removeConnectors(src.object_id, object_id, 'Realisation');
    }

    async selectSourcesRows() {
        return Repository.queryRows(SELECT_SOURCES_PROPERIES);
    }

    async selectSourcesMap() {
        const sourceProperties = await this.selectSourcesRows();
        const sourceMap = {};
        for (const prop of sourceProperties) {
            const src = sourceMap[prop.source_id] ?? (sourceMap[prop.source_id] = { name: prop.name, uid: prop.uid });
            src[prop.property] = prop.value;
            if (prop.property == 'opensearch') {
                src.type = 'opensearch';
                src.sourceId = prop.value;
            }
        }
        return sourceMap;
    }

    async selectApiSources(systemCode) {

        const [c4Rows, providedRows] = await Promise.all(
            [
                Repository.queryRows(SELECT_API_SOURCES, [systemCode]),
                Repository.queryRows(SELECT_PROVIDED_API_SOURCES, [systemCode])
            ]
        );

        return { c4Rows: c4Rows, providedRows: providedRows };
    }

    /**
     * 
     * @returns {Promise<Array<{ api_metric_template}>>}
     */
    async selectMethodsSources() {
        return Repository.queryRows(SELECT_METHOD_SOURCES);
    }

    async selectMapicMetricTempalte() {
        const metric =  await Repository.queryOne(SELECT_MAPIC_METRIC_TEMPLATE);
        if( metric ) return metric.api_metric_template;
        return null;
    }

    async selectSystemMethodsSources(systemCode) {
        const [methodsSources] = await Promise.all(
            [
                Repository.queryRows(`${SELECT_METHOD_ALL_SOURCES} WHERE LOWER(i.app_code)=LOWER($1)`, [systemCode]),
            ]
        )
        return methodsSources;
    }

    async setObjectApiTemplate(object_id, apiMetricTemplate) {
        await Repository.updateObjectTags(object_id, { [API_METRIC_TEMPLATE_TAG]: apiMetricTemplate }, [API_METRIC_TEMPLATE_TAG]);
        return Repository.first(t_objectproperties, { object_id: object_id, property: API_METRIC_TEMPLATE_TAG });
    }

    async setContainerApiTemplate(containerCode, apiMetricTemplate) {
        const containerRows = await Repository.query(SELECT_SYSTEM_CONTAINERS_CODE, containerCode);
        if (!containerRows.length) throw NotFound(`Container with code=[${containerCode}] not found`);

        for (const row of containerRows) {
            await Repository.updateObjectTags(row.object_id, { [API_METRIC_TEMPLATE_TAG]: apiMetricTemplate }, [API_METRIC_TEMPLATE_TAG]);
        }

        return { containerCode: containerCode, apiMetricTemplate: apiMetricTemplate };
    }

    async setInterfaceApiTemplate(interfaceCode, apiMetricTemplate) {
        return Repository.transactionScope(async () => {
            const innerfaceRows = await Repository.query(SELECT_INTERFACE_BY_CODE, interfaceCode);
            if (!innerfaceRows.length) throw NotFound(`Interface with code=[${interfaceCode}] not found`);

            for (const row of innerfaceRows) {
                await Repository.updateObjectTags(row.object_id, { [API_METRIC_TEMPLATE_TAG]: apiMetricTemplate }, [API_METRIC_TEMPLATE_TAG]);
            }

            const result = await Repository.first(t_objectproperties, { object_id: innerfaceRows[0].object_id, property: API_METRIC_TEMPLATE_TAG });
            if (result?.value != apiMetricTemplate) {
                throw Error('unknown error')
            }

            return { interfaceCode: interfaceCode, apiMetricTemplate: result.value };
        });
    }
}
