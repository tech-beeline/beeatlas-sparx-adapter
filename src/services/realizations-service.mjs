import Repository from "../utils/ea-repo.mjs";

class RealizationService {
    async getCapabilityRealizations(code) {

        const rows = await Repository.queryRows({
            text: `select 
        service.name as service, service.ea_guid as code, 
        cmp.ea_guid as cuid,
        cmp.name as component, 
        cmp.alias as componentCode,
        cmp.object_type, 
        cmp.stereotype
        from 
            t_object cap
            join t_xref dx on dx.name='DefaultDiagram' and cap.ea_guid=dx.client
            join t_diagram rd on rd.ea_guid=dx.supplier
            join t_connector cr on cr.end_object_id=cap.object_id and cr.stereotype='ArchiMate_Realization'
            join t_diagramlinks cl on cl.diagramid=rd.diagram_id and cr.connector_id=cl.connectorid
            join t_object service on service.object_id=start_object_id
            left join t_connector cc 
                on cc.end_object_id=service.object_id and cc.stereotype='ArchiMate_Realization' and cc.connector_id in (
                select connectorid from t_diagramlinks where diagramid=rd.diagram_id)
            left join t_object cmp on cmp.object_id=cc.start_object_id
        where cap.alias=$1`, values: [code]
        });

        let realizations = {};
        for (let r of rows) {
            if (!realizations[r.code]) realizations[r.code] = { code: r.code, name: r.service, interfaces: [] };
            if (!r.object_type)
                continue;
            realizations[r.code].interfaces.push({
                type: r.object_type,
                code: r.componentcode,
                name: r.component
            })
        }
        return Object.values(realizations);
    }
}

export default new RealizationService();