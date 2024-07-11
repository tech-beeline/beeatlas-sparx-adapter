export const RPS_THRESHOLD_TAG = "TPSThreshold"

export const LATENCY_THRESHOLD_TAG = "LatencyThreshold";
export const ERROR_RATE_THRESHOLD_TAG = "ErrorThreshold";

const METHOD_PARAMTER_QUERY = `
select p.*
from t_operation op
 join t_object i on i.object_id=op.object_id
 join t_operationparams p on p.operationid=op.operationid
where i.object_id=$1 and i.object_type='Interface'
`;


export const METHODS_QUERY = `select 
i.ea_guid as i_uid, i.name as interface_name, i.alias as interface_code,
o.name as operation, o.ea_guid as operation_guid,
rps.value as rps, l.value as latency, e.value as error 
from t_operation o
join t_object i on i.object_id=o.object_id
left join t_operationtag rps on rps.elementid=o.operationid and rps.property='${RPS_THRESHOLD_TAG}'
left join t_operationtag l on l.elementid=o.operationid and l.property='${LATENCY_THRESHOLD_TAG}'
left join t_operationtag e on e.elementid=o.operationid and e.property='${ERROR_RATE_THRESHOLD_TAG}'`;

export default { METHOD_PARAMTER_QUERY };