import { xml2js } from "xml-js";
import Repository from "../utils/ea-repo.mjs";
import OSLC from "../utils/oslc.mjs";
import domainsService, { DomainNotFoundException } from "./domains-service.mjs";
import Capability from "../model/capability.mjs";

const CAPABILITY_QUERY =
    `with recursive capabilities as (
	select
		p.object_id as id,
		d.alias as code,
		d.name as name, 
		true as "isDomain",
		d.descr as description,
		po.alias as "parent", 
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

class CapabiliiesService {

    /**
     * 
     * @returns {Promise<Array<{
     * code : string, name: string, isDomain: boolean, description: string, parent: { domainCode:string?, capabilityCode: string?},
     * owner: string, author: string, status : string, createdDate: Date, modifedDate: Date
     * }>>}
     */
    async getCapabitiesAsFlatList() {
        return (await Repository.queryRows(CAPABILITY_QUERY))
            .map(c => {
                return new Capability(c);
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
            const parent = cap.parentCode;
            if (parent) {
                let parent = ret[parent] = ret[parent] ?? { code: parent };
                parent.children = parent.children ?? [];
                parent.children.push(cap);
            } else {
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
                `${CAPABILITY_QUERY}
    where code=$1`, values: [code]
        });
        if (caps.length === 0)
            return null;
        return new Capability(caps[0]);
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<Capability[]>}
     */
    async getCapabilityChildren(code) {
        return (await Repository.queryRows({
            text: `${CAPABILITY_QUERY}
            where "parent" = $1`, values: [code]
        }))
            .map(c => new Capability(c));
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