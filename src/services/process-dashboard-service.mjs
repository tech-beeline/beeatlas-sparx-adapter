import Repository from "../utils/ea-repo.mjs";


const PROCESS_STATUS =
    `with  recursive using_hierarchy as ( 
	select 
			diagram_id as user_id, diagram_id as used_id, 0 as deep
		from t_diagram 
	union
	select distinct 
			parent.user_id, oref.pdata1::integer, deep+1
		from using_hierarchy parent
		join t_diagramobjects od on parent.used_id = od.diagram_id
		join t_object oref on oref.object_id=od.object_id and oref.object_type='InteractionOccurrence'
)
select
	coalesce(srv_owner.name::text || '/' || srv.name::text, srv.name) as "serverName",
	srv.object_type as "serverType",
	coalesce( srv_owner.alias, srv.alias) as "serverCode",
	coalesce(client_owner.name || '/' || client.name, client.name) as "clientName",
	client.object_type as "clientType",
	client.alias as "clientCode",
	msg.name as operation,
	proc_seq.name as "baseDiagramName",
	dref.name as "subDiagramName",
	uh.deep as "subDiagramDeep",
	grp.name as "groupName",
	base.name as "baseProcessName",
	key_proc.name as "keyProcessName",
	proc.name as "processFolder"
	from t_package root
	join t_package grp on grp.parent_id=root.package_id
	left join t_package base on base.parent_id=grp.package_id
	left join t_package key_proc on key_proc.parent_id=base.package_id
	left join t_package proc on proc.parent_id=key_proc.package_id
	left join t_diagram proc_seq on proc_seq.package_id=key_proc.package_id or proc_seq.package_id=proc.package_id
	left join using_hierarchy uh on uh.user_id=proc_seq.diagram_id
	left join t_diagram dref on dref.diagram_id = uh.used_id::integer
	left join t_connector msg on uh.used_id=msg.diagramid-- and msg.name <> 'use' and msg.name <> ''
	left join t_object client on client.object_id=msg.start_object_id
	left join t_object client_owner on client_owner.object_id=client.parentid
	left join t_object srv on srv.object_id=msg.end_object_id
	left join t_object srv_owner on srv.parentid=srv_owner.object_id
where root.ea_guid ='{44673B34-2358-4da0-887E-06311EAB7CA2}'`;


export class ProcessStatusRow {
    serverName; 
    serverType; 
    serverCode;
	clientName; clientType; clientCode;
    groupName; 
    baseProcessName; 
    keyProcessName;
    baseDiagramName; 
    subDiagramName;
    operation;
}

class ProcessDashboardService {
    /**
     * 
     * @returns {Promise<ProcessStatusRow[]>}
     */
    async getProcessStatusRows() {
        return Repository.queryRows(PROCESS_STATUS);
    }
}

export default new ProcessDashboardService();