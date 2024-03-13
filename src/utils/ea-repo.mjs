import pg from 'pg'
import t_object from './ea-model/t_object.mjs';
import { v4 as uuid } from 'uuid'
import t_package from './ea-model/t_package.mjs';
import t_connector from './ea-model/t_connector.mjs';

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

    async queryRows(sql) {
        let client = new pg.Client(this.config);
        await client.connect();
        let rows = (await client.query(sql)).rows;
        client.end();
        return rows;
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
    async create(type, value) {
        if (!(value instanceof type)) value = new type(value);
        if (value.beforeCreate) value.beforeCreate();

        let field_values = Object.entries(value).filter(([k, v]) => v);
        const text = `INSERT INTO ${type.name}(${field_values.map(([k, v]) => `${k}`).join(',')}) VALUES(${field_values.map((v, i) => `$${i + 1}`)}) RETURNING *`;

        let client = new pg.Client(this.config);
        await client.connect();
        let res = await client.query({ text: text, values: field_values.map(([_, v]) => v) });
        client.end();
        if (res.rowCount)
            return new type(res.rows[0]);
    }
    async find(type, condition) {
        const text = `SELECT * FROM ${type.name} where ${Object.entries(condition).map(([k, v], i) => ` ${k}=$${i + 1} `).join('AND')}`
        return this.queryRows({ text: text, values: Object.values(condition) }).then(rows => rows.map(r => new type(r)));
    }
    /**
     * 
     * @param {t_object} obj 
     */
    async createObject(obj) {
        return this.create(t_object, obj);
    }
    /**
     * 
     * @param {t_package} pkg 
     */
    async putPackage(pkg) {
        return (await this.find(t_package, { parent_id: pkg.parent_id, name: pkg.name }).then(rows => rows.find(r => r))) ?? (await this.createPackage({ parent_id: pkg.parent_id, name: pkg.name }));
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

            return await this.create(t_connector, connector_properties);
        }
        return connector;
    }
    async createPackage(pkg) {
        /**
         * @type {t_package}
         */
        let new_pkg = await this.create(t_package, pkg);
        const obj = this.createObject({ name: new_pkg.name, ea_guid: new_pkg.ea_guid, object_type: 'Package', package_id: pkg.parent_id, author: 'FDM API', version: '1.0', pdata1: new_pkg.package_id })
        return new_pkg;
    }
}

export default new Repository();