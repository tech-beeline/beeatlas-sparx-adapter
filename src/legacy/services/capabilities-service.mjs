import { xml2js } from "xml-js";
import OSLC from "../../utils/oslc.mjs";
import domainsService, { DomainNotFoundException } from "./domains-service.mjs";
import Capability from "../model/capability-legacy.mjs";
import { BadRequest, NotImplemented } from "../../utils/errors.mjs";
import Repository,
{
    t_package,
    t_object
} from "../../api/repositories/sparx-ea-repository/index.mjs";

import capabilitServiceInstance from "../../api/services/capability-service/index.mjs";

const actualService = capabilitServiceInstance;

class CapabiliiesService {

    /**
     * 
     * @returns {Promise<Array<{
     * code : string, name: string, isDomain: boolean, description: string, parent: { domainCode:string?, capabilityCode: string?},
     * owner: string, author: string, status : string, createdDate: Date, modifedDate: Date
     * }>>}
     */
    async getCapabitiesAsFlatList() {
        const ret = await actualService.getAll();
        ret.forEach(c => c.parent = c.parent?.code);
        return ret;
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

        const caps = await actualService.getByCode(code);
        if (!caps)
            return null;
        caps.parent = caps.parent?.code;
        return caps;
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<Capability[]>}
     */
    async getCapabilityChildren(code) {
        return (await capabilitiesRepository.selectChildren(code))
            .map(c => new Capability(c));
    }

    /**
     * 
     * @param {string} code 
     * @param {Capability} capabilityData 
     */
    async putCapability(code, capabilityData) {
        if (!capabilityData) {
            throw BadRequest('В теле не передается capability')
        }
        if (!capabilityData.parent) {
            throw BadRequest('Capability parent is not specified');
        }

        capabilityData.code = code;
        const parent = await capabilitiesRepository.selectByCode(capabilityData.parent);

        if (!parent) throw BadRequest(`Не найден родительская возможность/домен с кодом ${capabilityData.parent}`);
        const capability_asis = await capabilitiesRepository.selectByCode(code);

        if (capability_asis && capability_asis.isDomain != capabilityData.isDomain)
            throw BadRequest('Нельзя менять тип возможности (Домен на BC и BC на Домен');

        const capabilityDTO = capability_asis ?
            (await capabilitiesRepository.updateCapability(
                capabilityData.parent,
                capabilityData.code,
                capabilityData.isDomain,
                capabilityData.name,
                capabilityData.description,
                capabilityData.author,
                capabilityData.status)) :
            capabilityData.isDomain ?
                (await capabilitiesRepository.createDomain(
                    capabilityData.parent,
                    code,
                    capabilityData.name,
                    capabilityData.description,
                    capabilityData.author,
                    capabilityData.status)) :
                (await capabilitiesRepository.createCapability(
                    capabilityData.parent,
                    code,
                    capabilityData.name,
                    capabilityData.description,
                    capabilityData.author,
                    capabilityData.status));

        if (capabilityData.owner && capabilityData.owner.length) {
            await capabilitiesRepository.setCapabilityOwner(code, capabilityData.owner);
            capabilityDTO.owner = capabilityData.owner;
        }
        return new Capability(capabilityDTO);
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