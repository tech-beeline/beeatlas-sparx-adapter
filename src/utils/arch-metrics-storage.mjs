import pg from 'pg'
import { NotImplemented } from './errors.mjs';

const STORAGE_URL = process.env.FDM_URL?.startsWith("jdbc:") ? (new URL(process.env.FDM_URL.slice(5))).hostname : process.env.FDM_URL;
const STORAGE_USER = process.env.FDM_USERNAME;
const STORAGE_PASSWORD = process.env.FDM_PASSWORD;
const STORAGE_DB = process.env.FDM_DATABASE ?? "fdm_db"


const METRIC_QUERIES = {
    SELECT_PLUGIN_METRICS: "SELECT * FROM arch_metrics.plugin_actions",
    INCREASE_PLUGIN_ACTIONS_COUNTER: `INSERT INTO arch_metrics.plugin_actions (version,action,plugin_user,count)
    VALUES($1, $2, $3, 1)
    ON CONFLICT (version,action,plugin_user)
    DO UPDATE SET count=arch_metrics.plugin_actions.count + 1`,
    LOG_TC_CHANGE: `INSERT INTO arch_metrics.tc_change_log (code,name, change_date) VALUES($1,$2,$3)`
}

export default class ArchMetrics {

    static async #query(sql, ...args) {
        const client = new pg.Client({ user: STORAGE_USER, host: STORAGE_URL, password: STORAGE_PASSWORD, database: STORAGE_DB });
        await client.connect();
        let { rows } = (await client.query(sql, args));
        await client.end();
        return rows;
    }

    static async onPluginAction(version, action, user) {
        try {
            await this.#query(METRIC_QUERIES.INCREASE_PLUGIN_ACTIONS_COUNTER, version, action, user);
        } catch (error) {
            console.error(error);
        }
    }
    /**
     * 
     * @param {(version,action,user,count)=>void} action_cb 
     * @param {(users)=>void} users_cb
     */
    static async initPluginActionCounter(action_cb) {
        try {
            for (const row of await this.#query(METRIC_QUERIES.SELECT_PLUGIN_METRICS)) {
                action_cb(row.version, row.action, row.plugin_user ?? "FDM API", Number(row.count));
            }
        } catch (error) {
            console.error(error);
        }
    }

    static async onTCChanged({ code, name, change_date }) {
        try {
            await this.#query(METRIC_QUERIES.LOG_TC_CHANGE, code, name, change_date ?? new Date())
        } catch (error) {
            console.error(error);
        }
    }
}