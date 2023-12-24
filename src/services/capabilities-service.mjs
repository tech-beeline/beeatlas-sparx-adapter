import { xml2js } from "xml-js";
import Repository from "../utils/ea-repo.mjs";
import OSLC from "../utils/oslc.mjs";
import domainsService, { DomainNotFoundException } from "./domains-service.mjs";

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
            text:
                `select
    d.alias as "domainAlias",
        cap.alias as code, cap.name as name, cap.stereotype,
        cap.author as author, cap.note as description,
        cap.status, cap.createddate as "createdDate", cap.modifieddate as "modifiedDate",
        ow.name as "owner"
    from v_domains d
        join t_object dmn on dmn.ea_guid=d.ea_guid
        join t_connector dmn_aggr on dmn_aggr.start_object_id=dmn.object_id and dmn_aggr.stereotype='ArchiMate_Aggregation'
        join t_object cap on cap.object_id=dmn_aggr.end_object_id
        left join t_connector oc on oc.end_object_id=cap.object_id and oc.connector_type='Responsibility'
        left join t_object ow on ow.object_id=oc.start_object_id and ow.stereotype='ArchiMate_BusinessActor'
    where d.alias=$1`, values: [code]
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
     * @returns {Promise<Array<{
     * code : string, name: string, isDomain: boolean, description: string, parent: { domainCode:string?, capabilityCode: string?},
     * owner: string, author: string, status : string, createdDate: Date, modifedDate: Date
     * }>>}
     */
    async getCapabitiesAsFlatList() {
        return (await Repository.queryRows(
            `with recursive capabilities as (
	select
		p.object_id as id,
		d.alias as code,
		d.name as name, 
		true as "isDomain",
		d.descr as description,
		po.alias as "parentCode", 
		true as "isParentDomain",
		d.owner,
		p.author, 
		p.status, 
		p.createddate as "createdDate", 
		p.modifieddate as "modifiedDate"
	from v_domains d
		inner join t_object p on p.ea_guid=d.ea_guid
		left join  t_package parent on parent.package_id=d.parent_id
		left join  t_object po on po.ea_guid=parent.ea_guid
	union
	select 
		cap.object_id,
		cap.alias,
		cap.name,
		false as "isDomain",
		cap.note,
		p.code as parentCode,
		p."isDomain",
		coalesce((SELECT DISTINCT obe.name
                   FROM t_connector co,
                    t_object obe
                  WHERE co.end_object_id = cap.object_id AND obe.object_id = co.start_object_id AND co.stereotype = 'Responsibility' 
		 			AND obe.stereotype = 'ArchiMate_BusinessActor' limit 1), p.owner ),
		cap.author,
		cap.status,
		cap.createddate,
		cap.modifieddate
	from t_connector rel
		join capabilities p on p.id=rel.start_object_id and rel.stereotype='ArchiMate_Aggregation'
		join t_object cap on cap.object_id=rel.end_object_id and cap.stereotype='ArchiMate_Capability'
        where cap.alias is not null
)
select * from capabilities
`
        )).map(c => {
            return {
                code: c.code,
                isDomain: c.isDomain,
                name: c.name,
                description: c.description,
                author: c.author,
                status: c.status,
                createdDate: c.createdDate,
                owner: c.owner,
                parent: !c.parentCode ? undefined : c.isParentDomain ? { domainCode: c.parentCode } : { capabilityCode: c.parentCode }
            };
        })
    }
    async getCapabilitiesTree() {
        const flat_data = await this.getCapabitiesAsFlatList();
        let ret = {};
        let roots = [];
        for (const cap of flat_data) {
            if (ret[cap.code]) {
                Object.assign(ret[cap.code], cap);
            } else ret[cap.code] = cap;
            const parentCode = cap.parent?.capabilityCode ?? cap.parent?.domainCode;
            if (parentCode) {
                let parent = ret[parentCode] = ret[parentCode] ?? { code: parentCode };
                parent.children = parent.children ?? [];
                parent.children.push(cap);
            } else{
                roots.push(cap);
            }
        }
        return roots;
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<Capability>}
     */
    async getCapabilityByCode(code) {
        const caps = await Repository.queryRows({
            text:
                `select
    dmn.alias as "domainAlias", dmn.object_type,dmn.stereotype, cap.ea_guid,
        cap.alias as code, cap.name as name, cap.stereotype,
        cap.author as author, cap.note as description,
        cap.status, cap.createddate as "createdDate", cap.modifieddate as "modifiedDate",
        ow.name as "owner"
    from t_object dmn
        join t_connector dmn_aggr on dmn_aggr.start_object_id=dmn.object_id and dmn_aggr.stereotype='ArchiMate_Aggregation'
        join t_object cap on cap.object_id=dmn_aggr.end_object_id
        left join t_connector oc on oc.end_object_id=cap.object_id and oc.connector_type='Responsibility'
        left join t_object ow on ow.object_id=oc.start_object_id and ow.stereotype='ArchiMate_BusinessActor'
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

    async getCapabilityOwners(capability) {
        if (!capability.domain?.code && !capability.parent?.code) {
            throw Error(`Не указан код домена или код родительской возможности`);
        }
        if (capability.parent?.code) {
            let parent_capability = await this.getCapabilityByCode(capability.parent.code);
            return {
                parent: parent_capability,
                domain: await domainsService.getDomainByCode(parent_capability.domainAlias)
            };
        }
        return { domain: await domainsService.getDomainByCode(capability.domain.code) };
    }

    async createCapability(capability) {
        if (!capability.code) {
            throw Object.assign(Error(`Не указан код возможности`), { status: 400 });
        }
        let current_capability = await this.getCapabilityByCode(capability.code);
        if (current_capability) {
            let error = Error(`Capability ${capability.code} already exists`);
            //   error.status = 409
            throw Object.assign(Error(`Capability ${capability.code} already exists`), { status: 409 });
        }

        let { domain, parent } = await this.getCapabilityOwners(capability);

        if (!domain) {
            throw new DomainNotFoundException(capability.domain?.code ?? parent?.domain?.code);
        }

        const parent_ref = { parentPackageGUID: domain.ea_guid };
        // Создаем Capability
        let res = await OSLC.createResource({
            alias: capability.code, name: capability.name, description: capability.description ?? undefined, status: capability.status ?? undefined,
            author: capability.author ?? undefined, resourceType: "Element", type: "Class", stereotype: "ArchiMate3::ArchiMate_Capability"
        }, parent_ref);

        let dom = xml2js(res, { compact: true });
        res = await OSLC.readResource(dom["rdf:RDF"]["oslc_am:Resource"]._attributes["rdf:about"]);
        dom = xml2js(res, { compact: true });
        await OSLC.createLink(`el_${parent?.ea_guid ?? domain.ea_guid}`, dom["rdf:RDF"]["oslc_am:Resource"]["dcterms:identifier"]._text);
        //[ ] Сделать откат создания ресурса, если линк не создался

        return this.getCapabilityByCode(capability.code);
    }
    async updateCapability(capability) {
        if (!capability.code) {
            throw Object.assign(Error(`Не указан код возможности`), { status: 400 });
        }
        let current_info = await this.getCapabilityByCode(capability.code);
        if (!current_info) {
            throw Object.assign(Error(`Возможность с кодом "${capability.code}" не найдена`));
        }
        let res = await OSLC.updateResource({
            name: capability.name ?? undefined,
            status: capability.status ?? undefined,
            description: capability.description ?? undefined,
            identifier: `el_${current_info.ea_guid}`
        });
        return this.getCapabilityByCode(capability.code);
    }
    async deleteCapability(code) {
        if (!code) {
            throw Object.assign(Error('Не указан код'), { status: 400 });
        }
        let capability = await this.getCapabilityByCode(code);
        if (!capability) {
            throw Object.assign(Error(`Возможность с кодом "${code}" не найдена`), { status: 404 });
        }
        await OSLC.deleteResource(`el_${capability.ea_guid}`);
    }
}

export default new CapabiliiesService();