import pg from 'pg'

let STORAGE_URL = process.env.FDM_URL?.startsWith("jdbc:") ? (new URL(process.env.FDM_URL.slice(5))).hostname : process.env.FDM_URL;
let STORAGE_USER = process.env.FDM_USERNAME;
let STORAGE_PASSWORD = process.env.FDM_PASSWORD;
let STORAGE_DB = process.env.FDM_DATABASE ?? "fdm_db"

if (!STORAGE_URL) console.error(`FDM URL is not set`)
if (!STORAGE_USER) console.error(`FDM User is not set`)
if (!STORAGE_PASSWORD) console.error(`FDM password is not set`);


const CONFIG = {
    user: STORAGE_USER,
    host: STORAGE_URL,
    password: STORAGE_PASSWORD,
    database: STORAGE_DB,
    max: 20,
    idleTimeoutMillis: 30000,
    //connectionTimeoutMillis: 15000
};

const pool = new pg.Pool(CONFIG);

class FDMStorage {
    config() {
        STORAGE_URL = process.env.FDM_URL?.startsWith("jdbc:") ? (new URL(process.env.FDM_URL.slice(5))).hostname : process.env.FDM_URL;
        STORAGE_USER = process.env.FDM_USERNAME;
        STORAGE_PASSWORD = process.env.FDM_PASSWORD;
        STORAGE_DB = process.env.FDM_DATABASE ?? "fdm_db"
    }
    /**
     * 
     * @param {string} sql 
     * @param  {...any} args 
     * @returns {Promise<Array>}
     */
    async query(sql, ...args) {
        try {
            let { rows } = (await pool.query(sql, args));
            return rows;
        } catch (error) {
            console.error(error);
            throw Error(`Ошибка при запросе базы данных FDM: ${error.message}`, error);
        }
    }
}

export default new FDMStorage();