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


export const TC_API_QUERY = `with realisation as (
	select l.end_object_id as from_id, o.* 
	from t_connector l 
		join t_object o on o.object_id=l.start_object_id
	where l.connector_type='Realisation'
), api_tags as (
	select p.object_id, p.value as protocol
	from t_objectproperties p where p.property='protocol'
), op_tags as (
	select o.operationid, rps.value as rps, l.value as latency, e.value as error_rate
	from t_operation o
		left join t_operationtag rps on rps.elementid=o.operationid and rps.property='TPSThreshold'
		left join t_operationtag l on l.elementid=o.operationid and l.property='LatencyThreshold'
		left join t_operationtag e on e.elementid=o.operationid and e.property='ErrorThreshold'
)
select  op.name, op.ea_guid as operation_guid, api.name as api, api.alias as api_code, api.ea_guid as api_guid
,container.name as container, container.alias as container_code, 
sys.name as sys_name , sys.alias as sys_code,
tc.name as tc_name, tc.alias as tc_code,
api_tags.protocol, op_tags.*
from t_operation op
join t_object api on api.object_id=op.object_id
left join op_tags on op_tags.operationid=op.operationid
left join api_tags on api_tags.object_id=api.object_id
left join realisation container on container.from_id=api.object_id
left join realisation sys on sys.from_id=container.object_id
left join t_connector l on l.start_object_id=api.object_id and l.connector_type='Realisation'
left join t_object tc on tc.object_id= l.end_object_id and tc.stereotype='ArchiMate_TechnicalCapability'
`

export default { METHOD_PARAMTER_QUERY };