import OSLC from "../utils/oslc.mjs";
import Repository from "../utils/ea-repo.mjs";
import { NotImplementedRoute } from "../utils/href.mjs";

export const ROOT_DOMAIN_UID = process.env.ROOT_DOMAIN_UID ?? "{CC4EAE49-4A1B-4ef5-9C76-83D629ECF603}";

class Domain {
    code;
    name;
    description;
    author;
    status;
    createdDate;
    modifiedDate;
    parentAlias;
}

export class DomainAlreadyExistException extends Error{

}

class DomainsService {
    /**
     * 
     * @param {boolean?} all 
     * @returns {Promise<Array<Domain>>}}
     */
    async getDomains(all) {
        if (all) {
            throw Error('not imlemented');
        }
        return Repository.queryRows(
            {
                text: `select
                d.alias as code,d.name as name, d.descr as description,po.alias as "parentAlias", p.author, p.status, p.createddate as "createdDate", p.modifieddate as "modifiedDate"
            from v_domains d
            inner join t_object p on p.ea_guid=d.ea_guid
            left join  t_package parent on parent.package_id=d.parent_id
            left join  t_object po on po.ea_guid=parent.ea_guid`, values: []
            }
        );
    }
    async getDomainByCode(code) {
        const domains = await Repository.queryRows({
            text: `select d.ea_guid,
        d.alias as code,d.name as name, d.descr as description,po.alias as "parentAlias", p.author, p.status, p.createddate as "createdDate", p.modifieddate as "modifiedDate"
    from v_domains d
    inner join t_object p on p.ea_guid=d.ea_guid
    left join  t_package parent on parent.package_id=d.parent_id
    left join  t_object po on po.ea_guid=parent.ea_guid
    where d.alias=$1`, values: [code]
        });
        if (domains.length === 0)
            return null;
        return domains[0];
    }
    async getSubdomains(code) {
        return Repository.queryRows({
            text: `select
            d.alias as code,d.name as name, d.descr as description,po.alias as "parentAlias", p.author, p.status, p.createddate as "createdDate", p.modifieddate as "modifiedDate"
    from v_domains d
    inner join t_object p on p.ea_guid=d.ea_guid
    left join  t_package parent on parent.package_id=d.parent_id
    left join  t_object po on po.ea_guid=parent.ea_guid
    where po.alias=$1`, values: [code]
        });
    }

    /**
     * 
     * @param {Domain} domain 
     */
    async createDomain(domain) {

        let current = (await this.getDomainByCode(domain.code));
        if( current){
            throw new DomainAlreadyExistException();
        }
       
        const parent_domain_uid = domain.parent?(await this.getDomainByCode(domain.parent.code)).ea_guid:ROOT_DOMAIN_UID;

        let result = await OSLC.createResource({
            alias: domain.code, name: domain.name, type: "Package", resourceType: "Package", parentPackageGUID: parent_domain_uid
        });
        return this.getDomainByCode( domain.code);
    }
}

export default new DomainsService();