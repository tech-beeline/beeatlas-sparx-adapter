
import fdmStorage from '../fdm-storage.mjs';

const METRIC_QUERIES = {
    SELECT_PLUGIN_METRICS: "SELECT * FROM arch_metrics.plugin_actions",
    INCREASE_PLUGIN_ACTIONS_COUNTER: `INSERT INTO arch_metrics.plugin_actions (version,action,plugin_user,template,count)
    VALUES($1, $2, $3, $4, 1)
    ON CONFLICT (version,action,template,plugin_user)
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

export class ArchMetricsRepository {

    static async onPluginAction(version, action, user, template) {
        try {
            await fdmStorage.query(METRIC_QUERIES.INCREASE_PLUGIN_ACTIONS_COUNTER, version, action, user, template);
        } catch (error) {
            console.error(error);
        }
    }
    /**
     * 
     * @param {(version,action,user,template,count)=>void} action_cb 
     * @param {(users)=>void} users_cb
     */
    static async initPluginActionCounter(action_cb) {
        try {
            console.info('Init C4 plugin counters: start')
            for (const row of await fdmStorage.query(METRIC_QUERIES.SELECT_PLUGIN_METRICS)) {
                action_cb(row.version, row.action, row.plugin_user ?? "FDM API", row.template, Number(row.count));
            }
            console.info('Init C4 plugin counters: done')
        } catch (error) {
            console.error(error);
        }
    }

    static async onTCChanged({ code, name, change_date }) {
        try {
            await fdmStorage.query(METRIC_QUERIES.LOG_TC_CHANGE, code, name, change_date ?? new Date())
        } catch (error) {
            console.error(error);
        }
    }

    static async upsertSystemAssessment(systemCode, fitnessFnCode, assessmentDate, assessmentDescription, assessmentStatus, resultDetails) {
        await fdmStorage.query(METRIC_QUERIES.UPSERT_SYSTEM_ASSESSMENT_RESULT, fitnessFnCode, systemCode, new Date(assessmentDate), assessmentDescription, assessmentStatus, resultDetails)
    }
    static async selectSystemAssessments(systemCode) {
        return fdmStorage.query(METRIC_QUERIES.SELECT_SYSTEM_ASSESSMENTS, systemCode)
    }
}