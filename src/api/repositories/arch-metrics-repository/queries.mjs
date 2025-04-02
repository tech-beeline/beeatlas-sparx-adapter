export const INSERT_PUT_SYSTEM_LOG = `
INSERT INTO arch_metrics.put_system_log(
	system_code, error, current_state, target_state, result_state
) 
VALUES(
	LOWER($1),$2,$3,$4,$5
)`