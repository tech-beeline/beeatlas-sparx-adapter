import pg from 'pg'


class Repository {
    #config
    constructor() {
        this.#config = {
            user: process.env.DB_EA_USER,
            password: process.env.DB_EA_PASSWORD,
            host: process.env.DB_EA_URL,
            database: process.env.DB_EA_DATABASE
        }
    }

    async queryRows(sql) {
        let client = new pg.Client(this.#config);
        await client.connect();
        let rows = (await client.query(sql)).rows;
        client.end();
        return rows;
    }
}

export default new Repository();