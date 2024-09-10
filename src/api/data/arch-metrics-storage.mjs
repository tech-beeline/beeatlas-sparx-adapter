import pg from 'pg'
import { NotImplemented } from '../../utils/errors.mjs';

const STORAGE_URL = process.env.FDM_URL?.startsWith("jdbc:") ? (new URL(process.env.FDM_URL.slice(5))).hostname : process.env.FDM_URL;
const STORAGE_USER = process.env.FDM_USERNAME;
const STORAGE_PASSWORD = process.env.FDM_PASSWORD;
const STORAGE_DB = process.env.FDM_DATABASE ?? "fdm_db"

if (!STORAGE_URL) console.error(`FDM URL is not set`)
if (!STORAGE_USER) console.error(`FDM User is not set`)
if (!STORAGE_PASSWORD) console.error(`FDM password is not set`)

const METRIC_QUERIES = {
    SELECT_PLUGIN_METRICS: "SELECT * FROM arch_metrics.plugin_actions",
    INCREASE_PLUGIN_ACTIONS_COUNTER: `INSERT INTO arch_metrics.plugin_actions (version,action,plugin_user,count)
    VALUES($1, $2, $3, 1)
    ON CONFLICT (version,action,plugin_user)
    DO UPDATE SET count=arch_metrics.plugin_actions.count + 1`,
    LOG_TC_CHANGE: `INSERT INTO arch_metrics.tc_change_log (code,name, change_date) VALUES($1,$2,$3)`,
    SELECT_SYSTEM_ASSESSMENTS: `SELECT 
	fitness_fn_code,
	system_code,
	assessment_date,
	assessment_description,
	assessment_status,
	result_details 
FROM arch_metrics.system_assessment_result
WHERE system_code=$1`,
    UPSERT_SYSTEM_ASSESSMENT_RESULT: `INSERT INTO arch_metrics.system_assessment_result
    (
        fitness_fn_code,
        system_code,
        assessment_date,
        assessment_description,
        assessment_status,
        result_details
    )
    VALUES
    (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
    )
    ON CONFLICT (fitness_fn_code,system_code)
    DO UPDATE SET 
        assessment_date=$3,
        assessment_description=$4,
        assessment_status = $5,
        result_details=$6
    `
}

export default class ArchMetricsStorage {

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

    static async upsertSystemAssessment(systemCode, fitnessFnCode, assessmentDate, assessmentDescription, assessmentStatus, resultDetails) {
        await this.#query(METRIC_QUERIES.UPSERT_SYSTEM_ASSESSMENT_RESULT, fitnessFnCode, systemCode, new Date(assessmentDate), assessmentDescription, assessmentStatus, resultDetails)
    }
    static async selectSystemAssessments(systemCode) {
        return this.#query(METRIC_QUERIES.SELECT_SYSTEM_ASSESSMENTS, systemCode)
    }
}