import applicationCatalog from "./application-catalog.mjs"

const DIAGRAM_TREE_CTE = `
d_refs as
(
	select od.diagram_id,o.object_id, d.diagram_id as child_diagram_id, d.ea_guid as child_diagram_uid
	from t_xref x
		join t_object o on o.ea_guid=x.client
		join t_diagram d on d.ea_guid=x.supplier and d.diagram_type='Sequence'
		join t_diagramobjects od on od.object_id=o.object_id and od.diagram_id <> d.diagram_id
	where x.name='DefaultDiagram'
	union distinct
	select odd.diagram_id,mep.object_id, ref.pdata1::integer, d.ea_guid
	from t_object mep 
		join t_object ref on ref.object_id=mep.parentid
		join t_diagramobjects odd on odd.object_id = ref.object_id and odd.diagram_id <> ref.pdata1::integer
		join t_diagram d on d.diagram_id=ref.pdata1::integer
	where mep.object_type='MessageEndpoint'
),
d_tree as
(
	select diagram_id as e2e_id, diagram_id as diagram_id, ea_guid as e2e_uid, ea_guid as diagram_uid
	from t_diagram where diagram_type='Sequence'
	union distinct
	select d.e2e_id, r.child_diagram_id, d.e2e_uid, r.child_diagram_uid
	from d_refs r
		join d_tree d on d.diagram_id=r.diagram_id
)`
const E2E_MESSAGES_QUERY = `with recursive ${DIAGRAM_TREE_CTE},
${applicationCatalog.APPLICATION_CATALOG_CTE}, msg as ( select distinct connector.connector_id, connector.diagramid as diagram_id, connector.seqno, 
	connector.ea_guid as message_uid,
	cl.name as client, connector.name as message, cl.object_id as client_id,
	connector.end_object_id as server_id, srv.name as server, d_refs.child_diagram_uid, srv.object_type as server_type
	from t_connector connector
		join t_object srv on srv.object_id=connector.end_object_id
		join t_object cl on cl.object_id=connector.start_object_id
		left join d_refs on d_refs.object_id=srv.object_id
	where connector.pdata4='0'
)
select 
	msg.message, msg.message_uid,  msg.seqno,msg.client_id, msg.server_id, msg.child_diagram_uid, 
	msg.server_type, msg.server,
	d.name as diagram, d_tree.*,
	op.value as operation_guid
from d_tree
	join msg on msg.diagram_id=d_tree.diagram_id
	join t_diagram d on d.diagram_id=msg.diagram_id
	left join t_connectortag op on op.property='operation_guid' and elementid=msg.connector_id
where d_tree.e2e_uid=$1`

export default { E2E_MESSAGES_QUERY }