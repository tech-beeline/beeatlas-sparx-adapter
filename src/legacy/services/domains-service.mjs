import OSLC from "../../utils/oslc.mjs";
import Repository from '../../api/repositories/sparx-ea-repository/index.mjs';


export const ROOT_DOMAIN_UID = process.env.ROOT_DOMAIN_UID ?? "{CC4EAE49-4A1B-4ef5-9C76-83D629ECF603}";

class Domain {
    ea_guid;
    code;
    name;
    description;
    author;
    status;
    createdDate;
    modifiedDate;
    parentAlias;
}

export class DomainAlreadyExistException extends Error {
    code;
    constructor(code){
        super( `Domain with code [${code}] already exists`);
        this.code = code;
    }

}

export class DomainNotFoundException extends Error {
    status = 404;
    constructor(code) {
        super(`domain with code = "${code}" not found`);
    }
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
    /**
     * 
     * @param {string} code 
     * @returns {Promise<Domain?>}
     */
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
        if (current) {
            throw new DomainAlreadyExistException( domain.code);
        }

        const parent_domain_uid = domain.parent ? (await this.getDomainByCode(domain.parent.code)).ea_guid : ROOT_DOMAIN_UID;

        let result = await OSLC.createResource({
            alias: domain.code, name: domain.name, type: "Package", resourceType: "Package", parentPackageGUID: parent_domain_uid, status: domain.status
        });
        return this.getDomainByCode(domain.code);
    }
    async updateDomain(code, domain) {
        if (!code) {
            throw Error("update domain: [code] parameter not set")
        }
        let current = await this.getDomainByCode(code);
        if (!current) {
            throw new DomainNotFoundException(code);
        }
        let update_result = await OSLC.updateResource({ name: domain.name, status: domain.status, description: domain.description, identifier: `pk_${current.ea_guid}` });
        return this.getDomainByCode(code);
    }
    async deleteDomain( code ){
        let domain = await this.getDomainByCode(code);
        if( !domain ){
            throw new DomainNotFoundException( code );
        }
        await OSLC.deleteResource(`pk_${domain.ea_guid}`);
    }
}

export default new DomainsService();