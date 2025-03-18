import fdmStorage from '../fdm-storage.mjs';
import { PluginAction } from './model.mjs';

const METRIC_QUERIES = {
    SELECT_PLUGIN_METRICS: "SELECT * FROM arch_metrics.plugin_actions",
    INCREASE_PLUGIN_ACTIONS_COUNTER: `INSERT INTO arch_metrics.plugin_actions (version,action,plugin_user,template_id,count)
    VALUES($1, $2, $3, $4, 1)
    ON CONFLICT (version,action,template_id,plugin_user)
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
    `,
    REFRESH_ACTION_STAT: `WITH cte_stat_map AS (
SELECT 
	l.version,l.action, l.plugin_user, l.template_id, l.cmdb, l.element_uid, count(*) as add_num, s.id
FROM arch_metrics.plugin_actions_log l
	LEFT JOIN arch_metrics.plugin_actions_stat s ON s.version=l.version
		AND s.action=l.action
		AND COALESCE(s.plugin_user,'')=COALESCE(l.plugin_user,'')
		AND COALESCE(s.template_id,'')=COALESCE(l.template_id,'')
		AND COALESCE(s.cmdb,'')=COALESCE(l.cmdb,'')
		AND COALESCE(s.element_uid,'')=COALESCE(l.element_uid,'')
WHERE stat_date IS NULL OR log_date > stat_date
GROUP BY l.version,l.action, l.plugin_user, l.template_id, l.cmdb, l.element_uid, s.id
), cte_new AS
(
	INSERT INTO arch_metrics.plugin_actions_stat 
	(version,action,plugin_user,template_id,cmdb, element_uid, count, stat_date)
	SELECT version,action,plugin_user,template_id,cmdb, element_uid, add_num, now()
	FROM cte_stat_map WHERE id IS NULL
RETURNING
	version,action,template_id,plugin_user,cmdb, element_uid, count
),
cte_up AS (
	UPDATE arch_metrics.plugin_actions_stat
	SET count=arch_metrics.plugin_actions_stat.count + s.add_num,
	stat_date=now()
	FROM cte_stat_map s
	WHERE arch_metrics.plugin_actions_stat.id=s.id
	RETURNING
		s.version,s.action,s.template_id,s.plugin_user,s.cmdb, s.element_uid, count
)
SELECT *
FROM cte_new
UNION
SELECT * 
FROM cte_up`,
    SELECT_ACTION_STAT: `SELECT 
	l.version,l.action, l.plugin_user, l.template_id, l.cmdb, l.element_uid, l.count
FROM arch_metrics.plugin_actions_stat l`,
    INSERT_ACTION: `WITH cte_var AS (
	SELECT
		$1 AS version,
		$2 AS action,
		lower($3) AS plugin_user,
		$4 AS template_id,
		$5 AS cmdb,
		$6 AS element_uid,
        $7 as body
), cte_stat_up AS (
	UPDATE arch_metrics.PLUGIN_ACTIONS_STAT s
	SET count=count+1
	FROM cte_var v
	WHERE v.version=s.version
		AND v.action=s.action
		AND COALESCE(v.plugin_user,'unknown')=s.plugin_user
		AND COALESCE(v.template_id,'')=COALESCE(s.template_id,'')
		AND COALESCE(v.cmdb,'')=COALESCE(s.cmdb,'')
		AND COALESCE(v.element_uid,'')=COALESCE(s.element_uid,'')
	RETURNING s.*
), cte_stat_in AS (
	INSERT INTO arch_metrics.PLUGIN_ACTIONS_STAT(
		version,
		action,
		plugin_user,
		template_id,
		cmdb,
		element_uid,
		count
	)
	SELECT version,
		action,
		plugin_user,
		template_id,
		cmdb,
		element_uid,
		1
	FROM cte_var v
	WHERE NOT EXISTS (
		SELECT 1 FROM cte_stat_up s
		WHERE v.version=s.version
		AND v.action=s.action
		AND COALESCE(v.plugin_user,'unknown')=s.plugin_user
		AND COALESCE(v.template_id,'')=COALESCE(s.template_id,'')
		AND COALESCE(v.cmdb,'')=COALESCE(s.cmdb,'')
		AND COALESCE(v.element_uid,'')=COALESCE(s.element_uid,'')
	)
	RETURNING *
), cte_stat AS(
	SELECT * FROM cte_stat_up
	UNION
	SELECT * from cte_stat_in
)
INSERT INTO arch_metrics.PLUGIN_ACTIONS_LOG
(
	stat_id,
	version,
	action,
	plugin_user,
	template_id,
	cmdb,
	element_uid,
	body
)
SELECT s.id,
		s.version,
		s.action,
		s.plugin_user,
		s.template_id,
		s.cmdb,
		s.element_uid,
		jsonb(v.body)
FROM cte_var v
	JOIN cte_stat s ON 1=1
RETURNING *`
}

export class ArchMetricsRepository {

    /**
     * 
     * @param {string} version 
     * @param {string} action 
     * @param {string} user 
     * @param {string} template_id 
     */
    static async onPluginAction(version, action, user, template_id) {
        try {
            await fdmStorage.query(METRIC_QUERIES.INCREASE_PLUGIN_ACTIONS_COUNTER, version, action, user?.toLowerCase() ?? "unknown", template_id);
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 
     * @param {PluginAction} pluginAction 
     */
    static async insertPluginAction(pluginAction) {
        try {
            const { version, action: action, template_id, user, cmdb, element_uid } = pluginAction;
            await fdmStorage.query(METRIC_QUERIES.INSERT_ACTION, version, action, user?.toLowerCase() ?? "unknown", template_id, cmdb, element_uid,
                JSON.stringify(pluginAction)
            )
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 
     * @param {(version,action,user,template, cmdb, element_uid, count)=>void} action_cb 
     * @param {(users)=>void} users_cb
     */
    static async initPluginActionCounter(action_cb) {
        try {
            console.info('Init C4 plugin counters: start');
            for (const row of await fdmStorage.query(METRIC_QUERIES.SELECT_ACTION_STAT)) {
                action_cb(row.version, row.action, row.plugin_user ?? "FDM API", row.template_id, row.cmdb, row.element_uid, Number(row.count));
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