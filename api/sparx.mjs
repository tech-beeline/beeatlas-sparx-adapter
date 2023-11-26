import https from "https"
import pg from 'pg'

const QUERY_BUILDER = {
    domainQuery: function (rootPackageUID) {
        return {
            text: `WITH RECURSIVE pkgs(parent_id, package_id, ea_guid, parent_guid) AS (
            SELECT t_package.parent_id,
               t_package.package_id,
               t_package.ea_guid,
               t_package.ea_guid
              FROM t_package
                where ea_guid =$1
           UNION ALL
            SELECT chld.parent_id,
               chld.package_id,
               chld.ea_guid,
               p.parent_guid
              FROM t_package chld,
               pkgs p
             WHERE p.package_id = chld.parent_id
           )
    SELECT 
        dm.alias as code,
        dm.name as name,
       dm.note as description,
       dm.status as status,
       dm.author as author,
       dm.createddate  as "createdDate",
       dm.modifiedDate as "modifiedDate"
    from 
        pkgs, t_object dm
   where pkgs.package_id=dm.package_id
       and dm.stereotype = 'ArchiMate_Capability'`, values: [rootPackageUID]
        }
    },
    domains: () => `select
    d.alias as code,d.name as name, d.descr as description,po.alias as "parentAlias", p.author, p.status, p.createddate as "createdDate", p.modifieddate as "modifiedDate"
from v_domains d
inner join t_object p on p.ea_guid=d.ea_guid
left join  t_package parent on parent.package_id=d.parent_id
left join  t_object po on po.ea_guid=parent.ea_guid`,
    domainByCode: (code) => ({
        text: `select
    d.alias as code,d.name as name, d.descr as description,po.alias as "parentAlias", p.author, p.status, p.createddate as "createdDate", p.modifieddate as "modifiedDate"
from v_domains d
inner join t_object p on p.ea_guid=d.ea_guid
left join  t_package parent on parent.package_id=d.parent_id
left join  t_object po on po.ea_guid=parent.ea_guid
where d.alias=$1`, values: [code]
    })
    ,
    subdomains: code => ({
        text: `select
        d.alias as code,d.name as name, d.descr as description,po.alias as "parentAlias", p.author, p.status, p.createddate as "createdDate", p.modifieddate as "modifiedDate"
from v_domains d
inner join t_object p on p.ea_guid=d.ea_guid
left join  t_package parent on parent.package_id=d.parent_id
left join  t_object po on po.ea_guid=parent.ea_guid
where po.alias=$1`, values: [code]
    }),
    domainCapabilities: (code) => ({
        text: `select c.alias as code, c.name, c.author, c.status, c.note as description, d.alias as "domainAlias", p.alias as "parentAlias", ow.name as "ownerName"
        from v_domains d
         join t_object c on c.package_id=d.id
         left join t_object p on p.object_id=c.parentid
		 left join t_connector oc on oc.end_object_id=c.object_id and oc.connector_type='Responsibility'
		 left join t_object ow on ow.object_id=oc.start_object_id and ow.stereotype='ArchiMate_BusinessActor'
         where d.alias=$1
         and c.stereotype in ('ArchiMate_Capability','ArchiMate_TechnicalCapability')`, values: [code]
    }),
    capabilities: () => `select 
	ob.name, 
	ob.ea_guid,
	ob.stereotype,
	ob.object_id,
	ob.author,
	ob.modifieddate as "modifiedDate",
	ob.createdDate as "createdDate",
	ob.note as description,
	ob.alias as code,
	ob.status,
	 coalesce((select obe.name 
	 from t_connector co,  t_object obe 
	 where co.end_object_id = ob.object_id
	 and obe.object_id = co.start_object_id
	 and co.stereotype = 'Responsibility'
	 and obe.stereotype = 'ArchiMate_BusinessActor' limit 1 ) ,'')
	   as owner,
	(select tob.alias from t_object tob where tob.ea_guid = d.ea_guid ) as "domainAlias"
from 	t_object ob , v_domains d
where d.id=ob.package_id
	and ob.stereotype in ('ArchiMate_Capability','ArchiMate_TechnicalCapability')
`,
    capability: (code) => ({
        text: `select 
ob.name, 
ob.ea_guid,
ob.stereotype,
ob.object_id,
ob.author,
ob.modifieddate as "modifiedDate",
ob.createdDate as "createdDate",
ob.note as description,
ob.alias as code,
ob.status,
 coalesce((select obe.name 
 from t_connector co,  t_object obe 
 where co.end_object_id = ob.object_id
 and obe.object_id = co.start_object_id
 and co.stereotype = 'Responsibility'
 and obe.stereotype = 'ArchiMate_BusinessActor' limit 1 ) ,'')
   as "ownerName",
(select tob.alias from t_object tob where tob.ea_guid = d.ea_guid ) as "domainAlias"
from 	t_object ob , v_domains d
where d.id=ob.package_id
and ob.stereotype in ('ArchiMate_Capability','ArchiMate_TechnicalCapability')
and ob.alias=$1`, values: [code]
    })
}

const DEFAULT_PG_CONFIG = {
    user: 'fdm_user',
    password: '12fdmuser09',
    host: 'mn-seadb01.vimpelcom.ru',
    database: 'ea_repository'
}
const DEFAULT_ROOT_PACKAGE_UID = "{CC4EAE49-4A1B-4ef5-9C76-83D629ECF603}";

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

class Capability {
    code;
    name;
    description;
    status;
    author;
    parentAlias;
    domainAlias;
    stereotype;
}
export class SPARXApi {
    /**
     * @type {pg.Client}
     */
    static #pgClient;
    static #parseEnviromentConfig() {
        if (!process.env.EA_REPO_DATABASE)
            return null;
        const keys = process.env.EA_REPO_DATABASE.split(';');
        let ret = {};
        for (const s of keys) {
            let [key, value] = s.split('=');
            ret[key] = value;
        }
        if (!ret.user)
            throw Error('reqiure user value in EA_REPO_DATABASE enviroment variable')
        if (!ret.password)
            throw Error('reqiure password value in EA_REPO_DATABASE enviroment variable')
        if (!ret.host)
            throw Error('reqiure host value in EA_REPO_DATABASE enviroment variable')
        if (!ret.database)
            throw Error('reqiure database value in EA_REPO_DATABASE enviroment variable')

        return ret;
    }
    static async pgConnect() {

        const config = this.#parseEnviromentConfig() ?? DEFAULT_PG_CONFIG;
        SPARXApi.#pgClient = new pg.Client(config);
        SPARXApi.#pgClient.connect();
    }
    static async pgClient() {
        if (!SPARXApi.#pgClient)
            this.pgConnect();
        return SPARXApi.#pgClient;
    }
    static async queryRows(sql) {
        return (await ((await SPARXApi.pgClient()).query(sql))).rows;
    }
    /**
     * 
     * @param {boolean?} all 
     * @returns {Promise<Array<Domain>>}}
     */
    static async getDomains(all) {
        if (all) {
            throw Error('not imlemented');
        }
        return SPARXApi.queryRows(QUERY_BUILDER.domains());
    }
    /**
     * 
     * @param {string} code Код домена
     * @returns {Promise<Domain>}
     */
    static async getDomainByCode(code) { // [ ] Поменять выборки, что бы не надо было мапить (переименовать поля)
        if (!SPARXApi.#pgClient) {
            await SPARXApi.pgConnect();
        }
        let domain = (await SPARXApi.queryRows(QUERY_BUILDER.domainByCode(code)));

        if (domain.length === 0)
            return null;
        return domain[0];
    }
    static async getSubDomains(domainCode) {
        return SPARXApi.queryRows(QUERY_BUILDER.subdomains(domainCode));
    }
    /**
     * 
     * @param {string} domainCode 
     * @returns {Promise<Capability[]>}
     */
    static async getDomainCapabilities(domainCode) {
        return SPARXApi.queryRows(QUERY_BUILDER.domainCapabilities(domainCode));
    }

    static async getCapabilities(recursive) {
        if (recursive) {
            throw Error('not implemented');
        }
        return SPARXApi.queryRows(QUERY_BUILDER.capabilities());
    }
    /**
     * 
     * @param {string} code 
     * @returns {Promise<Capability>}
     */
    static async getCapaiblity(code) {
        return SPARXApi.queryRows(QUERY_BUILDER.capability(code));
    }
}