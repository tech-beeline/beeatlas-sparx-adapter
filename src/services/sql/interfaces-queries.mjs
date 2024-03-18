const METHOD_PARAMTER_QUERY = `
select p.*
from t_operation op
 join t_object i on i.object_id=op.object_id
 join t_operationparams p on p.operationid=op.operationid
where i.object_id=$1 and i.object_type='Interface'
`;

export default { METHOD_PARAMTER_QUERY };