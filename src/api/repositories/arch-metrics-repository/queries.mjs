import fdmStorage from "../fdm-storage.mjs";

export const INSERT_PUT_SYSTEM_LOG = `
INSERT INTO arch_metrics.put_system_log(
	system_code, error, current_state, target_state, result_state
) 
VALUES(
	LOWER($1),$2,$3,$4,$5
)`

export const SELECT_SYSTEM_CHANGES = `
SELECT
	id, log_date, system_code, error
FROM arch_metrics.put_system_log
WHERE LOWER(system_code)=LOWER($1)
ORDER BY log_date DESC
LIMIT 20
`;

export const SELECT_SYSTEM_CHANGE_BY_ID = `
SELECT
	*
FROM arch_metrics.put_system_log
WHERE id=$1
`;

export const selectSystemChanges = async (code) => fdmStorage.query(SELECT_SYSTEM_CHANGES, code);
export const selectSystemChangeByChangeId = async (id) => fdmStorage.query(SELECT_SYSTEM_CHANGE_BY_ID, id);