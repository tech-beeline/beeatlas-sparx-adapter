import pg from 'pg'
import t_object from './ea-model/t_object.mjs';
import { v4 as uuid } from 'uuid'
import t_package from './ea-model/t_package.mjs';
import t_connector from './ea-model/t_connector.mjs';
import t_operation from './ea-model/t_operation.mjs';
import t_diagram from './ea-model/t_diagram.mjs';

const ENVIROMENT_VARIABLE = {
    user: "DB_EA_USER", password: "DB_EA_PASSWORD", host: "DB_EA_URL", database: "DB_EA_DATABASE"
}

class Repository {
    #config;
    constructor() {

    }

    get config() {
        if (this.#config) return this.#config;

        let config = {};
        for (const name in ENVIROMENT_VARIABLE) {
            if (!process.env[ENVIROMENT_VARIABLE[name]]) {
                throw Error(`Environment variable [${ENVIROMENT_VARIABLE[name]}] not set`);
            }
            config[name] = process.env[ENVIROMENT_VARIABLE[name]];
        }
        if (config.host.startsWith('jdbc:')) {
            let url = new URL(config.host.slice(5));
            config.host = url.hostname;
            /*
            if( url.port ) config.port = url.port;
            if( url.pathname ){
                let paths = url.pathname.split('/');
                if( paths.length > 1) config.database = paths[1];
            }
            */
        }
        this.#config = config;
        return this.#config
    }

    /**
     * 
     * @param {String|{text : String, values : []}} sql 
     * @param {Array} values
     * @returns {Promise<Array>}
     */
    async queryRows(sql, values) {
        try {
            let client = new pg.Client(this.config);
            await client.connect();
            let rows = (await client.query(sql, values)).rows;
            await client.end();
            return rows;
        } catch (error) {
            console.log(sql?.text ?? sql);
            throw error;
        }
    }
    /**
   * 
   * @param {String|{text : String, values : []}} sql 
   * @param {Array} values 
   * @returns {Promise}
   */
    async queryOne(sql, values) {
        try {
            let client = new pg.Client(this.config);
            await client.connect();
            let rows = (await client.query(sql, values)).rows;
            await client.end();
            return rows.find(a => a);
        } catch (error) {
            console.log(sql?.text ?? sql);
            throw error;
        }
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
    async insert(type, value, client) {
        if (!(value instanceof type)) value = new type(value);
        if (value.beforeCreate) value.beforeCreate();

        let field_values = Object.entries(value).filter(([k, v]) => v);
        const text = `INSERT INTO ${type.name}(${field_values.map(([k, v]) => `${k}`).join(',')}) VALUES(${field_values.map((v, i) => `$${i + 1}`)}) RETURNING *`;

        if (client) return await client.query({ text: text, values: field_values.map(([_, v]) => v) }).then(
            v => v.rows.find(a => a));

        client = new pg.Client(this.config);
        await client.connect();

        try {
            await client.query('BEGIN');
            let res = await client.query({ text: text, values: field_values.map(([_, v]) => v) });
            await client.query('COMMIT');

            if (res.rowCount)
                return new type(res.rows[0]);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            await client.end();
        }
    }
    async update(type, value, condition) {
        if (!condition) throw Error('update condition is null ');
        let field_values = Object.entries(value).filter(([k, v]) => v);
        let condition_list = Object.entries(condition);
        const text = `UPDATE ${type.name} SET ${field_values.map(([k, v], i) => `${k} = $${i + 1}`).join(', ')} WHERE ${Object.entries(condition).map(([k, v], i) => `${k} = $${i + 1 + field_values.length}`).join(' AND ')}`;
        return this.queryRows({ text: text, values: [...field_values.map(([k, v]) => v), ...condition_list.map(([k, v]) => v)] });
    }

    async delete(type, condition) {
        throw Error('delete from ea repo is not imlemented');
    }

    async find(type, condition) {
        const text = `SELECT * FROM ${type.name} where ${Object.entries(condition).map(([k, v], i) => ` ${k}=$${i + 1} `).join('AND')}`
        return this.queryRows({ text: text, values: Object.values(condition) }).then(rows => rows.map(r => new type(r)));
    }
    async first(type, condition) {
        const text = `SELECT * FROM ${type.name} where ${Object.entries(condition).map(([k, v], i) => ` ${k}=$${i + 1} `).join('AND')}`
        return this.queryRows({ text: text, values: Object.values(condition) }).then(rows => rows.map(r => new type(r))).then(v => v.find(a => a));
    }
    /**
     * 
     * @param {t_object} obj 
     * @returns {Promise<t_object>}
     */
    async createObject(obj) {
        if (!obj.alias) {
            /**
             * @type {pg.Client}
             */
            let client = new pg.Client(this.config);
            await client.connect();
            try {
                await client.query('BEGIN');

                let autocount = obj.stereotype ? await this.queryOne({
                    text: `select * 
                from t_trxtypes
                where description = 'AutocountEx' and trx = $1`, values: [obj.stereotype]
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
                        trx.counter_a = String(Number(trx.counter_a) + 1).padStart(trx.counter_a.length, '0');
                        obj.alias = `${trx.prefix_a}${trx.counter_a}`;
                    }
                    await client.query({
                        text: 'UPDATE t_trxtypes SET notes=$1 where trx_id=$2',
                        values: [Object.entries(trx).map(([k, v]) => `${k}=${v};`).join(''), autocount.trx_id]
                    });
                    obj = await this.insert(t_object, obj, client);
                }
                await client.query('COMMIT');
                return obj;
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                await client.end();
            }

        }
        return this.insert(t_object, obj);
    }
    /**
     * 
     * @param {t_package} pkg 
     */
    async putPackage(pkg) {
        return (await this.find(t_package, { parent_id: pkg.parent_id, name: pkg.name }).then(rows => rows.find(r => r))) ?? (await this.createPackage({ parent_id: pkg.parent_id, name: pkg.name }));
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

    async putConnector(start_object_id, end_object_id, connector_type, additionalProperties) {
        let connector_properties = { start_object_id: start_object_id, end_object_id: end_object_id, connector_type: connector_type };
        let connector = await this.find(t_connector, connector_properties).then(rows => rows.find(r => r));

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
            }, additionalProperties ?? {}, connector_properties)

            return await this.insert(t_connector, connector_properties);
        }
        return connector;
    }
    async createPackage(pkg) {
        /**
         * @type {t_package}
         */
        let new_pkg = await this.insert(t_package, pkg);
        const obj = this.createObject({ name: new_pkg.name, ea_guid: new_pkg.ea_guid, object_type: 'Package', package_id: pkg.parent_id, author: 'FDM API', version: '1.0', pdata1: new_pkg.package_id })
        return new_pkg;
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
}

export default new Repository();