import pg from 'pg'

let STORAGE_URL = process.env.FDM_URL?.startsWith("jdbc:") ? (new URL(process.env.FDM_URL.slice(5))).hostname : process.env.FDM_URL;
let STORAGE_USER = process.env.FDM_USERNAME;
let STORAGE_PASSWORD = process.env.FDM_PASSWORD;
let STORAGE_DB = process.env.FDM_DATABASE ?? "fdm_db"

if (!STORAGE_URL) console.error(`FDM URL is not set`)
if (!STORAGE_USER) console.error(`FDM User is not set`)
if (!STORAGE_PASSWORD) console.error(`FDM password is not set`)

class FDMStorage {
    config() {
        STORAGE_URL = process.env.FDM_URL?.startsWith("jdbc:") ? (new URL(process.env.FDM_URL.slice(5))).hostname : process.env.FDM_URL;
        STORAGE_USER = process.env.FDM_USERNAME;
        STORAGE_PASSWORD = process.env.FDM_PASSWORD;
        STORAGE_DB = process.env.FDM_DATABASE ?? "fdm_db"
    }
    async query(sql, ...args) {
        const client = new pg.Client({ user: STORAGE_USER, host: STORAGE_URL, password: STORAGE_PASSWORD, database: STORAGE_DB });
        await client.connect();
        let { rows } = (await client.query(sql, args));
        await client.end();
        return rows;
    }
}

export default new FDMStorage();