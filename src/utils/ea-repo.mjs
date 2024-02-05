import pg from 'pg'

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
        if (config.host.startsWith('jdbc:')){
            let url = new URL( config.host.slice(5) );
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
    async getObjectsByAlias(alias) {
        return this.queryRows({ text: "select * from t_object where alias=$1", values: [alias] });
    }
}

export default new Repository();