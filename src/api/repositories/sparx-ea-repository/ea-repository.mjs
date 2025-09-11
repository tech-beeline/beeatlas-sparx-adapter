import pg from 'pg'
import { v4 as uuid } from 'uuid'
import {
    t_object,
    t_objectproperties,
    t_package,
    t_connector,
    t_connectortag,
    t_operation,
    t_diagram,
    t_operationtag,
    t_xref,
    t_diagramobjects,
    t_diagramlinks,
    t_operationparams
} from './ea-model/index.mjs';

import { t_diagramobjects_ex } from './ea-model/t_diagramobjects.mjs';
import { DELETE_CONNECTOR_BY_ID, DELETE_LINK_BY_CONNECTOR_ID, SELECT_DIAGRAMOBJECTS } from './ea-queries/diagram-queries.mjs';
import { SELECT_PACKAGE_BY_ALIAS } from './ea-queries/ea-pacakgies-queries.mjs';
import { OBJECT_STEREOTYPES } from './stereotypes/index.mjs';
import { REMOVE_CONNECTOR_TXREF_BY_START_END_STEREOTYPE, REMOVE_CONNECTORS_TAGS } from './ea-queries/remove-t_xref.mjs';
import { NotImplemented } from '../../../utils/errors.mjs';

import { AsyncLocalStorage } from 'node:async_hooks';
import { DELETE_OBJECT, SELECT_OBJECT_RELATIONS } from './ea-queries/delete/index.mjs';
import {
    INSERT_DIAGRAMOBJECTS,
    UPDATE_DIAGRAMOBJECT
} from './ea-queries/diagram/index.mjs';

import { created_package } from './ea-model/t_package.mjs';
import { DELETE_ALL_OBJECTS_CONNECTORS, DELETE_ALL_OBJECTS_LINKS } from './ea-queries/connector/index.mjs';


const transactionClient = new AsyncLocalStorage();

const ENVIROMENT_VARIABLE = {
    user: "DB_EA_USER", password: "DB_EA_PASSWORD", host: "DB_EA_URL", database: "DB_EA_DATABASE"
}

export const ARCHIMATE_AGGREGATION = 'ArchiMate3::ArchiMate_Aggregation';

export const UML_RESPONSIBILITY = 'UML Standart Profile::Responsibility';

const CONNECTOR_STEREOTYPE = {
    [ARCHIMATE_AGGREGATION]: {
        properties: {
            connector_type: 'Association', stereotype: 'ArchiMate_Aggregation',
            direction: 'Unspecified',
            destaccess: 'Public',
            sourceisaggregate: 1
        },
        t_xref: {
            Stereotypes: {
                type: 'connector property',
                description: '@STEREO;Name=ArchiMate_Aggregation;FQName=ArchiMate3::ArchiMate_Aggregation;@ENDSTEREO;', supplier: '<none>',
            }
        }
    },
    [UML_RESPONSIBILITY]: {
        properties: {
            connector_type: 'Usage', stereotype: 'Responsibility',
            direction: 'Source -> Destination',
            destaccess: 'Public',
            sourceisaggregate: 0
        },
        t_xref: {
            Stereotypes: {
                type: 'connector property',
                visibility: 'Public',
                description: '@STEREO;Name=Responsibility;FQName=StandardProfileL2::Responsibility;@ENDSTEREO;', supplier: '<none>',
            }
        }
    }
}

export class SparxRepositoryConfig {
    user;
    password;
    host;
    database;
    /**
     * 
     * @param {{user:string, password:string, host:string, database:string}} config 
     */
    constructor(config) {
        if (config) {
            this.user = config.user;
            this.password = config.password;
            this.host = config.host;
            this.database = config.database;
        }
    }
    static #default;
    static get default() {
        if (this.#default) return this.#default;
        return this.#default = SparxRepositoryConfig.readEnviroment();
    }
    static readEnviroment(config) {
        if (!config) {
            config = new SparxRepositoryConfig();
        }

        for (const name in ENVIROMENT_VARIABLE) {
            if (!process.env[ENVIROMENT_VARIABLE[name]]) {
                throw Error(`Environment variable [${ENVIROMENT_VARIABLE[name]}] not set`);
            }
            config[name] = process.env[ENVIROMENT_VARIABLE[name]];
        }
        if (config.host.startsWith('jdbc:')) {
            let url = new URL(config.host.slice(5));
            config.host = url.hostname;
        }
        return config;
    }
}


export class SparxRepository {
    #config;
    constructor(config) {
        if (config) this.#config = config;
    }

    get config() {
        return this.#config ?? (this.#config = SparxRepositoryConfig.default);
    }
    /**
     * 
     * @param {async ()=>void} fn 
     */
    async transactionScope(fn) {
        if (transactionClient.getStore()) { // if in transaction
            return fn();
        }

        const client = new pg.Client(this.config);
        await client.connect();
        try {
            await client.query('BEGIN')
            const ret = await transactionClient.run(client, fn);
            await client.query('COMMIT')
            return ret;
        } catch (error) {
            console.log('ROLLBACK');
            await client.query('ROLLBACK');
            throw error;
        } finally {
            await client.end();
        }
    }

    /**
     * 
     * @param {*} sql 
     * @param  {...any} values 
     * @returns {Promise<[]>}
     */
    async query(sql, ...values) {
        try {
            const storedClient = transactionClient.getStore();
            if (storedClient) {
                return (await storedClient.query(sql, sql.values ?? values)).rows;
            }
            let client = new pg.Client(this.config);
            await client.connect();
            let rows = (await client.query(sql, sql.values ?? values)).rows;
            await client.end();
            return rows;
        } catch (error) {
            console.trace(`Ошибка при выполнении запроса ${sql?.text ?? sql}: ${error.message}`);
            throw Error(`Ошибка при выполнении запроса к базе sparx ea`, { cause: error });
        }
    }

    /**
     * 
     * @param {String|{text : String, values : []}} sql 
     * @param {Array} values
     * @returns {Promise<Array>}
     */
    async queryRows(sql, values = []) {
        return this.query(sql, ...values);
    }
    /**
   * 
   * @param {String|{text : String, values : []}} sql 
   * @param {Array} values 
   * @returns {Promise}
   */
    async queryOne(sql, values = []) {
        return this.query(sql, ...values).then(r => r.find(a => a));
    }
    /**
     * 
     * @param {Promise<Array<t_object>>} alias 
     * @returns 
     */
    async getObjectsByAlias(alias) {
        return this.queryRows({ text: "select * from t_object where alias=$1", values: [alias] }).then(rows => rows.map(r => new t_object(r)));
    }
    /**
     * 
     * @param {t_object[]} alias 
     * @returns 
     */
    async objectByAlias(alias) {
        return this.getObjectsByAlias(alias).then(rows => rows.find(v => true));
    }
    async insert(type, value) {
        if (!(value instanceof type)) value = new type(value);
        if (value.beforeCreate) value.beforeCreate();

        let field_values = Object.entries(value).filter(([k, v]) => v);
        const text = `INSERT INTO ${type.name}(${field_values.map(([k, v]) => `${k}`).join(',')}) VALUES(${field_values.map((v, i) => `$${i + 1}`)}) RETURNING *`;

        return this.query({ text: text, values: field_values.map(([_, v]) => v) }).then(
            v => v.find(a => a));

    }
    async update(type, value, condition) {
        if (!condition) throw Error('update condition is null ');
        let field_values = Object.entries(value);//.filter(([k, v]) => v);
        let condition_list = Object.entries(condition);
        const text = `UPDATE ${type.name} SET ${field_values.map(([k, v], i) => `${k} = $${i + 1}`).join(', ')} 
        WHERE ${Object.entries(condition).map(([k, v], i) => `${k} = $${i + 1 + field_values.length}`).join(' AND ')} RETURNING *`;
        return this.query(text, ...field_values.map(([k, v]) => v), ...condition_list.map(([k, v]) => v));
    }

    async delete(type, condition) {
        const condition_list = Object.entries(condition);
        if (!condition_list.length) throw Error("Пустой список условий");

        const text = `DELETE FROM ${type.name} WHERE ${condition_list.map(([k, v], i) => `${k} = $${i + 1}`).join(' AND ')}`;
        return this.queryOne(text, condition_list.map(([k, v]) => v));
    }

    async find(type, condition) {
        if (!type.name) throw Error('type is invalid');
        const text = `SELECT * FROM ${type.name} where ${Object.entries(condition).map(([k, v], i) => ` ${k}=$${i + 1} `).join('AND')}`
        return this.queryRows({ text: text, values: Object.values(condition) }).then(rows => rows.map(r => new type(r)));
    }
    /**
     * 
     * @param {type} type 
     * @param {*} condition 
     * @returns 
     */
    async first(type, condition) {
        const text = `SELECT * FROM ${type.name} where ${Object.entries(condition).map(([k, v], i) => ` ${k}=$${i + 1} `).join('AND')}`
        return this.queryRows({ text: text, values: Object.values(condition) }).then(rows => rows.map(r => new type(r))).then(v => v.find(a => a));
    }


    async #prepareObjectAlias(obj) {
        if (!obj.alias) {
            let autocount = obj.stereotype ? await this.queryOne({
                text: `select * from t_trxtypes where description = 'AutocountEx' and trx = $1`, values: [obj.stereotype]
            }) : null;
            if (!autocount) {
                autocount = await this.queryOne({ text: `select * from t_trxtypes where description = 'Autocount' and trx = $1`, values: [obj.object_type] })
            }

            if (autocount) {
                let trx = autocount.notes.split(';').filter(a => a.length)
                    .map(v => v.split('='))
                    .reduce((acc, [k, v]) => Object.assign(acc, { [k]: v }), {});
                if (trx.active == '1') {
                    throw Error('not implemented')
                }
                if (trx.active_a == '1') {
                    obj.alias = `${trx.prefix_a}${trx.counter_a}`;
                    trx.counter_a = String(Number(trx.counter_a) + 1).padStart(trx.counter_a.length, '0');
                }
                await this.query({
                    text: 'UPDATE t_trxtypes SET notes=$1 where trx_id=$2',
                    values: [Object.entries(trx).map(([k, v]) => `${k}=${v};`).join(''), autocount.trx_id]
                });
            }
        }
        return obj;
    }

    /**
     * 
     * @param {t_object} obj 
     * @returns { {}|undefined}
     */
    #processStereotype(obj) {
        const stereotype_template = OBJECT_STEREOTYPES[obj.object_type];
        if (stereotype_template) {
            Object.assign(obj, stereotype_template.properties);
            return stereotype_template.t_xref;
        }
    }
    /**
     * 
     * @param {t_object} obj 
     * @returns {Promise<t_object>}
     */
    async createObject(obj) {
        return this.transactionScope(async () => {
            const xref = this.#processStereotype(obj);
            await this.#prepareObjectAlias(obj);

            obj.createddate = new Date();
            obj.modifieddate = new Date();

            obj = await this.insert(t_object, obj);
            if (xref) {
                for (let name in xref) {
                    await this.insert(t_xref, Object.assign({ name: name, client: obj.ea_guid }, xref[name]));
                }
            }
            return obj;
        })
    }
    /**
     * 
     * @param {t_package} pkg 
     * @returns {Promise<t_package>}
     */
    async putPackage(pkg) {
        return (await this.first(t_package, { parent_id: pkg.parent_id, name: pkg.name })) ??
            (await this.createPackage({ parent_id: pkg.parent_id, name: pkg.name }));
    }

    buildDiagram(d) {
        return Object.assign({
            package_id: 17888,
            version: '1.0',
            attpub: '1', attpri: '1', attpro: '1', orientation: 'P', cx: '795', cy: '1138', scale: '100',
            showforeign: '1', showborder: '1', showpackagecontents: '1'
        }, d);
    }
    async putDiagram(d) {
        return (await this.first(t_diagram, { package_id: d.package_id, name: d.name })) ??
            (await this.insert(t_diagram, this.buildDiagram(d)));
    }

    async removeConnectors(start_object_id, end_object_id, connector_type) {
        let condition = { start_object_id: start_object_id, end_object_id: end_object_id, connector_type: connector_type };
        const stereotype_template = CONNECTOR_STEREOTYPE[connector_type];
        if (stereotype_template) {
            Object.assign(condition, stereotype_template.properties);
            await this.queryOne(REMOVE_CONNECTOR_TXREF_BY_START_END_STEREOTYPE, [start_object_id, end_object_id, stereotype_template.properties.stereotype]);
        }
        await this.query(REMOVE_CONNECTORS_TAGS, start_object_id, end_object_id, connector_type);
        return this.delete(t_connector, condition)
    }

    async putConnector(start_object_id, end_object_id, connector_type, additionalProperties) {
        if (!start_object_id) throw Error('start_object_id is not specified');
        if (!end_object_id) throw Error('end_object_id is not specified');

        const stereotype_prop = CONNECTOR_STEREOTYPE[connector_type];

        let connector_properties = {
            start_object_id: start_object_id, end_object_id: end_object_id,
            connector_type: stereotype_prop?.properties?.connector_type ?? connector_type
        };

        let connector = await this.first(t_connector, connector_properties);

        if (!connector) {
            connector_properties = Object.assign({
                direction: 'Source -> Destination',
                sourceaccess: 'Public',
                destacces: 'Public',
                sourcecontainment: 'Unspecified',
                descontainment: 'Unspecified',
                sourceisaggregate: 0,
                sourceisordered: 0,
                destisaggregate: 0,
                destisordered: 0,
                linecolor: -1,
                rouestyle: 3
            }, additionalProperties ?? {}, connector_properties, stereotype_prop?.properties ?? {})

            connector = await this.insert(t_connector, connector_properties);
            for (let name in stereotype_prop?.t_xref ?? {}) {
                await this.insert(t_xref, Object.assign({ name: name, client: connector.ea_guid }, stereotype_prop.t_xref[name]));
            }
            return connector;
        }
        return connector;
    }
    /**
     * 
     * @param {created_package} pkg 
     * @returns {Promise<created_package>}
     */
    async createPackage(pkg) {
        /**
         * @type {t_package}
         */
        let new_pkg = await this.insert(t_package, pkg);

        const obj = await this.createObject({
            name: new_pkg.name, ea_guid: new_pkg.ea_guid, object_type: 'Package',
            package_id: pkg.parent_id, author: pkg.author ?? 'FDM API', version: '1.0', pdata1: new_pkg.package_id, status: pkg.status ?? 'Proposed', note: pkg.notes, alias: pkg.alias
        });

        Object.assign(obj, new_pkg);
        return obj;
    }

    async setMethodsDeleted(methodIds) {
        if (!methodIds || !methodIds.length) return;

        let client = new pg.Client(this.config);
        await client.connect();
        try {
            await client.query(`UPDATE t_operation SET 
            name = '[REMOVED] ' || name,
            stereotype = 'removed'
            where stereotype <> 'removed and operationid = ANY($1)
            `, [methodIds]);
        } catch (error) {
            await client.end();
        }

    }
    async deleteMethods(methodIds) {
        if (!methodIds || !methodIds.length) return;

        let client = new pg.Client(this.config);
        await client.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                {
                    text: `UPDATE t_connector SET name='[REMOVED] ' || name
                    where connector_id in ( 
                        select ot.elementid
                        from  t_connectortag ot 
                        join t_operation m on m.ea_guid=ot.value and ot.property='operation_guid' 
                        where m.operationid in (${Array.from({ length: methodIds.length }, (_, i) => `$${i + 1}`)}))`,
                    values: methodIds
                });

            await client.query(
                {
                    text: `
                    DELETE from t_connectortag 
                        where t_connectortag.elementid in ( 
                        select ot.elementid
                        from  t_connectortag ot 
                        join t_operation m on m.ea_guid=ot.value and ot.property='operation_guid' 
                        where m.operationid in (${Array.from({ length: methodIds.length }, (_, i) => `$${i + 1}`)}) ) 
                            and t_connectortag.property='operation_guid'`,
                    values: methodIds
                });

            await client.query(
                {
                    text: `DELETE FROM t_operationparams where operationid in (${Array.from({ length: methodIds.length }, (_, i) => `$${i + 1}`)})`,
                    values: methodIds
                });
            await client.query(
                {
                    text: `DELETE FROM t_operation where operationid in (${Array.from({ length: methodIds.length }, (_, i) => `$${i + 1}`)})`,
                    values: methodIds
                });
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            await client.end();
        }
    }
    /**
     * 
     * @param {Array<{object_id, name, type, description, ea_guid, pos}>} methods 
     */
    async insertMethods(methods) {
        if (!methods || !methods.length) return [];

        let client = new pg.Client(this.config);
        await client.connect();
        try {
            let inserted = []
            await client.query('BEGIN');
            for (const m of methods) {
                let method = (await client.query({
                    text:
                        `INSERT INTO t_operation(scope, concurrency, classifier, isroot, isleaf, isquery, pure, object_id, name, type, notes, ea_guid, pos )
                        VALUES( 'Public', 'Sequential', 0,0,0,0,0,$1,$2,$3,$4,$5,$6 ) RETURNING *`,
                    values: [m.object_id, m.name, m.type, m.description, m.ea_guid ?? `{${uuid().toUpperCase()}}`, m.pos]
                })).rows.find(v => v);
                inserted.push(new t_operation(method));
            }
            await client.query('COMMIT');
            return inserted;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            await client.end();
        }
    }
    /**
     * 
     * @param {Array<{operationid, name, description, type, pos}>} methods 
     * @returns 
     */
    async updateMethods(methods) {
        if (!methods || !methods.length) return;

        let client = new pg.Client(this.config);
        await client.connect();
        try {
            await client.query('BEGIN');
            for (const m of methods) {
                await client.query({
                    text:
                        `UPDATE t_operation SET
                            name = $2, type=$3, notes=$4, pos = $5
                        WHERE operationid=$1
                        `,
                    values: [m.operationid, m.name, m.type, m.description, m.pos]
                });
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            await client.end();
        }
    }
    /**
     * 
     * @param {Array<{operationid, name, description, type, pos}>} methods 
     * @returns 
     */
    async updateMethodParameters(parameters) {
        if (!parameters || !parameters.length) return [];

        let client = new pg.Client(this.config);
        await client.connect();
        try {
            await client.query('BEGIN');
            for (const p of parameters) {
                await client.query({
                    text:
                        `UPDATE t_operationparams SET
                            name = $2, type=$3, notes=$4, pos = $5
                        WHERE operationid=$1
                        `,
                    values: [p.operationid, p.name, p.type, p.description, p.pos]
                });
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            await client.end();
        }
    }

    async insertParameters(parameters) {
        if (!parameters || !parameters.length) return [];

        let client = new pg.Client(this.config);
        await client.connect();
        try {
            let inserted = []
            await client.query('BEGIN');
            for (const p of parameters) {
                let method = (await client.query({
                    text:
                        `INSERT INTO t_operationparams( kind, const, operationid, name, type, notes, ea_guid, pos )
                        VALUES( 'in', 0, $1,$2,$3,$4,$5,$6 ) RETURNING *`,
                    values: [p.operationid, p.name, p.type, p.description, p.ea_guid ?? `{${uuid().toUpperCase()}}`, p.pos]
                })).rows.find(v => v);
                inserted.push(new t_operation(method));
            }
            await client.query('COMMIT');
            return inserted;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            await client.end();
        }
    }

    async deleteParameters(paramersIds) {
        throw Error('not implemented')
    }
    async setOperationTag(operation_id, tag, value) {
        /** @type {t_operationtag} */
        const operation_tag = await this.first(t_operationtag, { elementid: operation_id, property: tag });
        if (operation_tag?.value === value) {
            return;
        }
        if (operation_tag) {
            if (value)
                return this.update(t_operationtag, { value: value }, { ea_guid: operation_tag.ea_guid });
            else
                return this.delete(t_operationtag, { ea_guid: operation_tag.ea_guid });
        }
        if (value)
            return this.insert(t_operationtag, { elementid: operation_id, property: tag, value: value });
    }

    async readObjectsTags(ids) {
        /**
         * @type {Array{t_objectproperties}}
         */
        const rows = await this.queryRows(`SELECT * from t_objectproperties where object_id = ANY($1)`, [ids]);
        return rows.reduce((map, t) => {
            const tags = map[t.object_id] ?? (map[t.object_id] = {})
            tags[t.property] = t.value;
            return map;
        }, {});
    }
    async readObjectTagsByObjectUID(uid) {
        /**
         * @type {Array{t_objectproperties}}
         */
        const rows = await this.query(`SELECT * from t_objectproperties where object_id = (SELECT object_id FROM t_object WHERE ea_guid=$1)`, uid);
        return rows.reduce((map, t) => {
            const tags = map[t.object_id] ?? (map[t.object_id] = {})
            tags[t.property] = t.value;
            return map;
        }, {});
    }
    /**
     * 
     * @param {*} object_id 
     * @param {*} obj 
     * @param {string[] | null} tags 
     */
    async updateObjectTags(object_id, obj, tags) {
        if (!object_id) throw Error('object_id is not specified');
        /**
         * @type {t_objectproperties[]}
         */
        tags = tags ?? Object.keys(obj);
        let current_tags = await this.queryRows("select * from t_objectproperties where object_id=$1 and property=ANY($2)", [object_id, tags]);
        for (let name of tags) {
            const ct = current_tags.find(t => t.property === name);
            if (ct) {
                if (obj[name])
                    await this.update(t_objectproperties, { value: obj[name] ?? "" }, { propertyid: ct.propertyid });
                else
                    await this.delete(t_objectproperties, { propertyid: ct.propertyid });
                continue;
            }
            if (obj[name]) {
                await this.insert(t_objectproperties, { object_id: object_id, value: obj[name], property: name });
            }
        }
    }

    async updateConnectorTags(connector_id, connector, tags) {
        /**
         * @type {t_objectproperties[]}
         */
        let current_tags = await this.queryRows("select * from t_connectortag where elementid=$1 and property=ANY($2)", [connector_id, tags]);
        for (let name of tags) {
            const ct = current_tags.find(t => t.property === name);
            if (ct) {
                await this.update(t_connectortag, { value: connector[name] ?? "" }, { propertyid: ct.propertyid });
                continue;
            }
            if (connector[name]) {
                await this.insert(t_connectortag, { elementid: connector_id, value: connector[name], property: name });
            }
        }
    }

    /**
     * 
     * @param {number} operation_id 
     * @param {*} tags 
     * @returns {Promise}
     */
    async updateOperationTags(operation_id, tags) {
        const currentTags = await this.queryRows('SELECT * FROM t_operationtag WHERE elementid=$1 AND property=ANY($2)', [operation_id, Object.keys(tags)]);
        for (const tag in tags) {
            const currentTag = currentTags.find(t => t.property === tag);
            const targetValue = tags[tag];
            if (currentTag?.value == targetValue) continue;
            if (!targetValue) {
                await this.queryOne(`DELETE FROM t_operationtag WHERE elementid=$1 AND property=$2`, [operation_id, tag]);
                continue;
            }
            if (!currentTag) {
                await this.insert(t_operationtag, { value: targetValue, elementid: operation_id, property: tag });
                continue;
            }
            await this.update(t_operationtag, { value: targetValue }, { elementid: operation_id, property: tag });
        }
    }

    /**
     * 
     * @param {string} diagramId 
     * @returns {Promise<Array<t_diagramobjects_ex>>}
     */
    async getDiagramObjects(diagramId) {
        return this.queryRows(SELECT_DIAGRAMOBJECTS, [diagramId]);
    }

    /**
     * 
     * @param {number} diagramId 
     * @param {t_diagramobjects} diagramobject 
     * @returns {Promise<t_diagramobjects}
     */
    async putDiagramObject(diagramId, diagramobject) {
        return (await this.first(t_diagramobjects, { diagram_id: diagramId, object_id: diagramobject.object_id })) ?? this.insert(t_diagramobjects, Object.assign(diagramobject, { diagram_id: diagramId }));
    }
    /**
     * 
     * @param {number} diagramId 
     * @param {t_diagramlinks} diagramlink 
     * @returns {Promise<t_diagramobjects}
     */
    async putDiagramLink(diagramId, diagramlink) {
        const c = await this.first(t_diagramlinks, { diagramid: diagramId, connectorid: diagramlink.connectorid });
        return c ??
            this.insert(t_diagramlinks, Object.assign(diagramlink, { diagramid: diagramId }));
    }
    async deleteConnector(connector_id) {
        await this.queryOne(DELETE_LINK_BY_CONNECTOR_ID, [connector_id]);
        return this.queryOne(DELETE_CONNECTOR_BY_ID, [connector_id]);
    }
    async deleteAllObjectsConnector(object_id_a, object_id_b) {
        await this.query(DELETE_ALL_OBJECTS_LINKS, object_id_a, object_id_b);
        return this.query(DELETE_ALL_OBJECTS_CONNECTORS, object_id_a, object_id_b);
    }
    /**
     * 
     * @param {*} alias 
     * @returns {Promise<t_package>}
     */
    async getPackageByAlias(alias) {
        return this.queryOne(SELECT_PACKAGE_BY_ALIAS, [alias])
    }

    /**
     * 
     * @param {number} object_id 
     * @returns {Promise<Array<t_object>>}
     */
    async getChildObjects(object_id) {
        return this.query(`SELECT * FROM t_object WHERE parentid=$1`, object_id);
    }

    /**
    * 
    * @param {number} package_id 
    * @returns {Promise<Array<t_package>>}
    */
    async getChildPackages(package_id) {
        return this.query(`SELECT * FROM t_package WHERE parent_id=$1`, package_id);
    }

    /**
     * 
     * @param {number} package_id 
     * @returns {Promise<Array<t_object>>}
     */
    async getPackageObjects(package_id) {
        return this.query(`SELECT * FROM t_object WHERE package_id=$1`, package_id);
    }

    /**
     * 
     * @param {number} package_id 
     * @returns {Promise<Array<t_diagram>>}
     */
    async getPackageDiagrams(package_id) {
        return this.query(`SELECT * FROM t_diagram WHERE package_id=$1`, package_id);
    }

    async deleteObject(object_id) {
        if (!object_id) throw Error('object_id is not specified');
        return this.transactionScope(async () => {

            const children = await this.getChildObjects(object_id);
            for (const child of children) {
                this.deleteObject(child.object_id);
            }
            for (const entity in DELETE_OBJECT) {
                await this.query(DELETE_OBJECT[entity], object_id);
            }
        });
    }

    async deleteDiagram(diagram_id) {
        NotImplemented();
    }

    async deletePackage(package_id) {
        return this.transactionScope(async () => {
            for (const subpackage of await this.getChildPackages(package_id)) {
                await this.deletePackage(subpackage.package_id);
            }

            for (const obj of await this.getPackageObjects(package_id)) {
                await this.deleteObject(obj.object_id);
            }
            for (const diagram of await this.getPackageDiagrams(package_id)) {
                await this.deleteDiagram(diagram.diagram_id)
            }
            for (const obj of await this.query(`SELECT object_id FROM t_object WHERE ea_guid IN (SELECT ea_guid FROM t_package where package_id=$1)`, package_id)) {
                await this.deleteObject(obj.object_id);
            }
            await this.query(`DELETE FROM t_package WHERE package_id=$1`, package_id);
        });
    }

    async canDeleteObject(object_id) {
        if (!object_id) throw Error("object_id==null");

        const relations = await this.queryOne(SELECT_OBJECT_RELATIONS, [object_id]);
        if (!relations) throw Error(`Не найден элемент с object_id=${object_id}`);
        for (const f in relations) {
            if (f !== 'object_id' && relations[f] != 0)
                return false;
        }
        return true;
    }
    async deleteOperation(operation_id) {
        await this.delete(t_operationparams, { operationid: operation_id });
        await this.delete(t_operationtag, { elementid: operation_id });
        await this.delete(t_operation, { operationid: operation_id });
    }

    async mergeElements(target_id, source_id) {
        // Связи
        // Диаграммы
        // методы
        // tagged values
        // t_xref
        // Родители
        NotImplemented();
    }

    /**
     * 
     * @param {number[]} linksIds 
     */
    async removeDiagramLinks(linksIds) {
        return this.query('DELETE FROM t_diagramlinks WHERE instance_id = ANY($1)', linksIds);
    }
    /**
     * 
     * @param {number[]} objectsIds 
     */
    async removeDiagramObjects(objectsIds) {
        return this.query('DELETE FROM t_diagramobjects WHERE object_id = ANY($1)', objectsIds);
    }

    /**
     * 
     * @param {number} diagramId
     * @param {t_diagramobjects} objects 
     */
    async insertDiagramObjects(diagramId, objects) {
        if (!diagramId)
            throw Error(`diagramId не задано при добавлениии t_diagramobjects`);
        if (!objects)
            throw Error(`Список объектов не задан при добавлении t_diagramojbects`);
        if (objects.find(c => !c))
            throw Error(`Найдены не заданные object_id в списке при добавлении t_diagramobjects`);
        return this.query(INSERT_DIAGRAMOBJECTS, diagramId, JSON.stringify(objects));
    }
    /**
     * 
     * @param {number} diagramId
     * @param {t_diagramobjects} objects 
     */
    async updateDiagramObjects(diagramId, objects) {
        return this.query(UPDATE_DIAGRAMOBJECT, diagramId, JSON.stringify(objects));
    }
    async updateObjectsPackage(packageId, objectIds) {
        if( !packageId) throw Error(`package id is not specified`);
        if( !objectIds) throw Error(`object list is null`);

        return this.query(`UPDATE t_object SET package_id=$1 WHERE object_id = ANY($2)`, packageId, objectIds);
    }
}

export default new SparxRepository();