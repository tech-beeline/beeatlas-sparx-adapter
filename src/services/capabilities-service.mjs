import Repository from "../utils/ea-repo.mjs";

export class Capability {
    code;
    name;
    description;
    status;
    author;
    parentAlias;
    domainAlias;
    stereotype;
}


class CapabiliiesService {
    async getCapabilityByDomainCode(code) {
        return Repository.queryRows({
            text: `select c.alias as code, c.name, c.author, c.status, c.note as description, d.alias as "domainAlias", p.alias as "parentAlias", ow.name as "ownerName"
            from v_domains d
             join t_object c on c.package_id=d.id
             left join t_object p on p.object_id=c.parentid
             left join t_connector oc on oc.end_object_id=c.object_id and oc.connector_type='Responsibility'
             left join t_object ow on ow.object_id=oc.start_object_id and ow.stereotype='ArchiMate_BusinessActor'
             where d.alias=$1
             and c.stereotype in ('ArchiMate_Capability','ArchiMate_TechnicalCapability')`, values: [code]
        });
    }
    async getCapabilities() {
        return Repository.queryRows(`select 
        cap.name, 
        cap.alias as code, 
        cap.note as description,
        coalesce((select obe.name 
         from t_connector co,  t_object obe 
         where co.end_object_id = cap.object_id
         and obe.object_id = co.start_object_id
         and co.stereotype = 'Responsibility'
         and obe.stereotype = 'ArchiMate_BusinessActor' limit 1 ) ,'')
           as "ownerName",
         d.alias as "domainAlias",
        ( select p.alias 
        from t_diagramlinks dl, t_connector r, t_object p
        where d.id=sc.package_id and sc.diagram_id=dl.diagramid and r.connector_id=dl.connectorid
            and r.stereotype='ArchiMate_Aggregation' and r.start_object_id=p.object_id and r.end_object_id=cap.object_id 
             and p.stereotype in ('ArchiMate_Capability','ArchiMate_TechnicalCapability')
         limit 1) as "parentAlias"
        from 
            v_domains d
        join t_diagram sc on d.id=sc.package_id
        join t_diagramobjects od on od.diagram_id=sc.diagram_id
        join t_object cap on cap.object_id=od.object_id and cap.stereotype in ('ArchiMate_Capability','ArchiMate_TechnicalCapability')
    `);
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<Capability>}
     */
    async getCapaibilitByCode(code) {
        const caps = await Repository.queryRows({
            text: `select 
            cap.name, 
            cap.alias as code, 
            cap.note as description,
            coalesce((select obe.name 
             from t_connector co,  t_object obe 
             where co.end_object_id = cap.object_id
             and obe.object_id = co.start_object_id
             and co.stereotype = 'Responsibility'
             and obe.stereotype = 'ArchiMate_BusinessActor' limit 1 ) ,'')
               as "ownerName",
             d.alias as "domainAlias",
            ( select p.alias 
            from t_diagramlinks dl, t_connector r, t_object p, t_object ch
            where sc.diagram_id=dl.diagramid and r.connector_id=dl.connectorid
                and r.stereotype='ArchiMate_Aggregation' and r.start_object_id=p.object_id and r.end_object_id=ch.object_id 
                 and p.stereotype in ('ArchiMate_Capability','ArchiMate_TechnicalCapability')
             limit 1) as "parentAlias"
            from 
                v_domains d
            join t_diagram sc on d.id=sc.package_id
            join t_diagramobjects od on od.diagram_id=sc.diagram_id
            join t_object cap on cap.object_id=od.object_id and cap.stereotype in ('ArchiMate_Capability','ArchiMate_TechnicalCapability')
            where cap.alias=$1
        `, values: [code]
        });
        if (caps.length === 0)
            return null;
        return caps[0];
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<Capability[]>}
     */
    async getCapabilityChildren(code) {
        return Repository.queryRows({
            text: `select 
            cap.name, 
            cap.alias as code, 
            cap.note as description,
            coalesce((select obe.name 
             from t_connector co,  t_object obe 
             where co.end_object_id = cap.object_id
             and obe.object_id = co.start_object_id
             and co.stereotype = 'Responsibility'
             and obe.stereotype = 'ArchiMate_BusinessActor' limit 1 ) ,'')
               as owner,
             d.alias as "domainAlias",
             p.alias as "parentAlias"
            from 
                v_domains d
            join t_diagram sc on d.id=sc.package_id
            join t_diagramobjects od on od.diagram_id=sc.diagram_id
            join t_object cap on cap.object_id=od.object_id and cap.stereotype in ('ArchiMate_Capability','ArchiMate_TechnicalCapability')
            join t_diagramlinks dl on dl.diagramid=sc.diagram_id
            join t_connector c on c.connector_id=dl.connectorid and c.end_object_id=cap.object_id
            join t_object p on c.start_object_id=p.object_id
            where p.alias = $1`, values: [code]
        });
    }
}

export default new CapabiliiesService();