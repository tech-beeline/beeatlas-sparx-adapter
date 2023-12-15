import pg from 'pg'

const ENVIROMENT_VARIABLE = {
    user : "DB_EA_USER", password : "DB_EA_PASSWORD", host: "DB_EA_URL", database: "DB_EA_DATABASE"
}

class Repository {
    #config = {};
    constructor() {
        for( const name in ENVIROMENT_VARIABLE){
            if( !process.env[ENVIROMENT_VARIABLE[name]]){
                throw Error(`Environment variable [${ENVIROMENT_VARIABLE[name]}] not set`);
            }
            this.#config[name] = process.env[ ENVIROMENT_VARIABLE[ name]];
        }
    }

    async queryRows(sql) {
        let client = new pg.Client(this.#config);
        await client.connect();
        let rows = (await client.query(sql)).rows;
        client.end();
        return rows;
    }
    async getObjectsByAlias( alias ){
        let client = new pg.Client(this.#config);
        await client.connect();
        let rows = (await client.query({text:"select * from t_object where alias=$1", values: [alias] })).rows;
        client.end();
        return rows;
    }
}

export default new Repository();