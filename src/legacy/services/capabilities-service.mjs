import { xml2js } from "xml-js";
import OSLC from "../../utils/oslc.mjs";
import domainsService, { DomainNotFoundException } from "./domains-service.mjs";
import Capability from "../model/capability-legacy.mjs";
import { BadRequest, NotImplemented } from "../../utils/errors.mjs";
import Repository,
{
    ARCHIMATE_CAPABILITY,
    CONNECTOR_STEREOTYPES,
    t_package,
    t_object
} from "../../api/repositories/sparx-ea-repository/index.mjs";
import { CapabilitiesRepository } from "../../api/repositories/index.mjs";

const capabilitiesRepository = new CapabilitiesRepository();

class CapabiliiesService {

    /**
     * 
     * @returns {Promise<Array<{
     * code : string, name: string, isDomain: boolean, description: string, parent: { domainCode:string?, capabilityCode: string?},
     * owner: string, author: string, status : string, createdDate: Date, modifedDate: Date
     * }>>}
     */
    async getCapabitiesAsFlatList() {
        return (await capabilitiesRepository.selectAll())
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
        const caps = await capabilitiesRepository.selectByCode(code);

        if (!caps)
            return null;

        return new Capability(caps);
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

    async #createDomain(capability, parent) {
        const code = capability.code;
        if (!parent.isDomain) throw BadRequest(`Объект с кодом ${capability.parent} не является доменом (при создании домена)`)
        if (!code.startsWith('DMN') && !code.startsWith('GRP')) throw BadRequest(`Код домена должен начинаться на DMN или на GRP`);

        const ea_parent = await Repository.first(t_package, { ea_guid: parent.ea_guid });
        const new_pkg = await Repository.createPackage({
            name: capability.name, notes: capability.description, alias: code, parent_id: ea_parent.package_id,
            author: capability.author, status: capability.status
        });
        return this.getCapabilityByCode(code);
    }

    /**
     * 
     * @param {Capability} capability 
     * @param {Capability} parent 
     * @returns {Promise<Capability>}
     */
    async #createBC(capability, parent) {
        const parent_package_id = parent.isDomain ? (await Repository.first(t_package, { ea_guid: parent.ea_guid })).package_id : parent.getPackageId();
        const bc_package = await Repository.putPackage({ parent_id: parent_package_id, name: "BC" });

        let ea_cap = await Repository.createObject({ name: capability.name, note: capability.description, alias: capability.code ?? undefined, package_id: bc_package.package_id, object_type: ARCHIMATE_CAPABILITY })

        await Repository.putConnector(parent.getCapabilityId(), ea_cap.object_id, CONNECTOR_STEREOTYPES.ARCHIMATE_AGGREGATION);

        return this.getCapabilityByCode(capability.code);
    }
    /**
     * 
     * @param {Capability} capability_asis 
     * @param {Capability} capability 
     * @param {Capability} parent 
     */
    async #updateBC(capability_asis, capability, parent) {
        if (capability_asis.isDomain !== capability.isDomain) throw BadRequest('Нельзя менять тип возможности (Домен на BC и ИС на Домен');
        await Repository.update(t_object, { name: capability.name, note: capability.description, status: capability.status, author: capability.author }, { ea_guid: capability_asis.ea_guid });
        if (capability.isDomain) await Repository.update(t_package, { name: capability.name, notes: capability.description }, { ea_guid: capability.ea_guid });

        if (capability_asis.parent != capability.parent) {
            NotImplemented('Изменение родителя пока не реализовано');
        }
        return this.getCapabilityByCode(capability.code);
    }
    /**
     * 
     * @param {string} code 
     * @param {Capability} capability 
     */
    async putCapability(code, capability) {
        if (!capability) {
            throw BadRequest('В теле не передается capability')
        }
        capability.code = code;
        const parent = await this.getCapabilityByCode(capability.parent);
        if (!parent) throw BadRequest(`Не найден родительская возможность/домен с кодом ${capability.parent}`);
        const capability_asis = await this.getCapabilityByCode(code);

        if (!capability_asis) {
            //Создание новой возможности
            if (!capability.parent) {
                throw BadRequest(`для capability не указан parent`);
            }

            if (capability.isDomain) {
                //Создаем домен
                //return this.#createDomain(capability, parent);
            }
            // Создание возможности
            return this.#createBC(capability, parent);
        }
        return this.#updateBC(capability_asis, capability, parent);
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