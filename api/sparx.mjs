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
`,
    capability: (code) => ({
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
    }),
    childCapability: (code) => ({
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
    }),
    capabilityRealizations: (code) => ({
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
    }),
    componentByCode: (code) => ({
        text: `select cmp.name, cmp.note as description, cmp.alias as code, cmp.status, cmp.author, cmp.createddate as "createdDate", cmp.modifieddate as "modifiedDate"
        from t_object cmp
        where cmp.alias=$1
            and cmp.object_type='Component'`, values: [code]
    }),
    componentInterfaces: (code) => ({
        text: `select cmp.object_id, api.name, api.alias
        from t_object cmp
        join t_object api on api.parentid=cmp.object_id and api.object_type='Interface'
        where cmp.alias=$1 and cmp.object_type='Component'`, values: [code]
    }),
    sequenceInteractions: () => `WITH RECURSIVE pkgs(parent_id, package_id, ea_guid, parent_guid) AS (
        SELECT t_package.parent_id,
           t_package.package_id,
           t_package.ea_guid,
           t_package.ea_guid
          FROM t_package
       UNION ALL
        SELECT chld.parent_id,
           chld.package_id,
           chld.ea_guid,
           p.parent_guid
          FROM t_package chld,
           pkgs p
         WHERE p.package_id = chld.parent_id
       )
    select 
    --d.name as process, d.ea_guid as duid, 
    coalesce(c_app.name || '.' || consumer.name , consumer.name) as consumer,
    coalesce( c_app.ea_guid, consumer.ea_guid) as consumer_uid
    , srv.object_type as srv_type
    ,coalesce(c_app.alias, consumer.alias) as consumer_code
      , coalesce (mth.name,msg.name) as operation, op.value as method
      ,coalesce( srv_app.name || '.' || srv.name, srv.name) as supplier
      ,coalesce( srv_app.ea_guid, srv.ea_guid) as supplier_uid
      ,coalesce( srv_app.alias, srv.alias ) as supplier_code,
      tags.value as ia, msg.pdata1 as interactionType
    --, d.author, d.modifieddate
    , srv.classifier_guid, i.name as interface_name
    , (select count(*) from t_operation io where io.object_id=i.object_id ) as method_count
          from pkgs v
          join  t_diagram d on d.package_id=v.package_id
              join t_connector msg on d.diagram_id=msg.diagramid and msg.connector_type='Sequence' and msg.pdata4 <> '1'
              join t_object consumer on consumer.object_id=msg.start_object_id and consumer.object_type <> 'Actor'
              join t_object srv on srv.object_id=msg.end_object_id
              left join t_object c_app on c_app.object_id=consumer.parentid
              left join t_object srv_app on srv_app.object_id=srv.parentid
              left join t_connectortag tags on tags.elementid=msg.connector_id and tags.property='InterfaceAgreement'
              left join t_connectortag op on op.elementid=msg.connector_id and op.property='operation_guid'
              left join t_operation mth on mth.ea_guid=op.value
              left join t_object i on i.ea_guid=srv.classifier_guid 
          where d.diagram_type='Sequence' 
          and v.parent_guid='{B441FDC2-21A2-40c3-9645-C9C4C13B01D4}'
          order by d.diagram_id, msg.seqno`
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

    static async getChildCapabilities(code) {
        return SPARXApi.queryRows(QUERY_BUILDER.childCapability(code));
    }

    static async getCapabilityRealizations(code) {
        const rows = await SPARXApi.queryRows(QUERY_BUILDER.capabilityRealizations(code));
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
    static async getComponentByCode(code) {
        return SPARXApi.queryRows(QUERY_BUILDER.componentByCode(code));
    }
    static async getComponentInterfaces(code) {
        return SPARXApi.queryRows(QUERY_BUILDER.componentInterfaces(code));
    }
    static async getSequenceInteractions() {
        return SPARXApi.queryRows(QUERY_BUILDER.sequenceInteractions());
    }
}