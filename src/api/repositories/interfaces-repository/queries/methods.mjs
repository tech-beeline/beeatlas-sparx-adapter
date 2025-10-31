export const SET_E2E_MSG_LEGACY = `
UPDATE t_connector
SET linecolor=255, isbold=3
WHERE connector_id IN (SELECT elementid FROM t_connectortag WHERE property='operation_guid' AND value=$1)
`

export const SET_E2E_MSG_VALID = `
UPDATE t_connector
SET linecolor=-1, isbold=0
WHERE connector_id IN (SELECT elementid FROM t_connectortag WHERE property='operation_guid' AND value=$1)
`