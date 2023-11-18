import express from "express"
import pg from "pg"
import { IARepository } from './ia.mjs'

const MESSAGE_QUERY = ` WITH RECURSIVE pkgs(parent_id, package_id, ea_guid, parent_guid) AS (
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
select d.name as process, d.ea_guid as duid, 
coalesce(c_app.name || '.' || consumer.name , consumer.name) as consumer
,c_app.alias as consumer_code
  , coalesce (mth.name,msg.name) as operation, op.value as method
  ,coalesce( srv_app.name || '.' || srv.name, srv.name) as supplier, 
  srv_app.alias as supplier_code,
  tags.value as ia, msg.pdata1 as interactionType
, d.author, d.modifieddate
, srv.object_type as srv_type, srv.classifier_guid, i.name as interface_name
, (select count(*) from t_operation io where io.object_id=i.object_id ) as method_count
      from pkgs v
      left join  t_diagram d on d.package_id=v.package_id
          left join t_connector msg on d.diagram_id=msg.diagramid and msg.connector_type='Sequence' and msg.pdata4 <> '1'
          left join t_object consumer on consumer.object_id=msg.start_object_id
          left join t_object c_app on c_app.object_id=consumer.parentid
          left join t_object srv on srv.object_id=msg.end_object_id
          left join t_object srv_app on srv_app.object_id=srv.parentid
          left join t_connectortag tags on tags.elementid=msg.connector_id and tags.property='InterfaceAgreement'
          left join t_connectortag op on op.elementid=msg.connector_id and op.property='operation_guid'
          left join t_operation mth on mth.ea_guid=op.value
          left join t_object i on i.ea_guid=srv.classifier_guid 
      where d.diagram_type='Sequence' 
      and v.parent_guid='{B441FDC2-21A2-40c3-9645-C9C4C13B01D4}'
      order by d.diagram_id, msg.seqno`;

const PG_CONFIG = {
    user: 'fdm_user',
    password: '12fdmuser09',
    host: 'mn-seadb01.vimpelcom.ru',
    database: 'ea_repository'
}


/**
 * @type {Array<(message)=>Array<string>>}
 */
const VALIDATION_RULES = [
    (sequence) => (sequence.srv_type === "ProvidedInterface" && sequence.method_count !== "0" && !sequence.method) ? [`Сообщение [${sequence.consumer}->${sequence.supplier} : ${sequence.operation}] не связан ни с одним из методов [${sequence.interface_name}]`] : [],
    (sequence) => (!sequence.ia && sequence.method) ? `Отсутствует ссылка на Interface Agreement` : null,
    async (sequence) => {
        if (sequence.ia) {
            const ia = await IARepository.Instance.byPath(sequence.ia);
            if (!ia) {
                return [`По адресу ${sequence.ia} в main branch interface-agreement отсутствует Interface Agreement`];
            }
            if (ia.parseError) {
                return [`Yaml parse error ${ia.parseError}`];
            }
            if( !ia.yaml.methods || !ia.yaml.methods.find( m=>m.name == sequence.operation)){
                return [`В Interface Agreement нет метода  ${sequence.operation}`];
            }
        }
    }
];

async function executeValidateRule(msg, rule) {
    return await rule(msg);
}
async function validateMessage(msg) {
    let ret = [];
    for (const vfn of VALIDATION_RULES) {
        let result = await executeValidateRule(msg, vfn);
        ret.push(...(result ?? []));
    }
    return ret;
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
export async function processGetSequenceResponse(req, res) {
    function isNeedValidation() {
        if (req.query.validate != null) {
            if (req.query.validate === "" || req.query.validate == "1" || req.query.validate == "true") {
                return true;
            } else if (req.query.validate != "false") {
                throw Error(`Invalid parameter: validate=${req.query.validate}`);
            }
        }
        return false;
    }
    try {
        const need_validation = isNeedValidation();

        const client = new pg.Client(PG_CONFIG);
        await client.connect();
        const sql_res = await client.query(MESSAGE_QUERY);
        sql_res.rows.forEach(m => Object.assign(m, { modifieddate: m.modifieddate.toLocaleString() }));
        if (need_validation) {
            for (let m of sql_res.rows) {
                Object.assign(m, { comments: await validateMessage(m) });
            }
        }
        res.json(sql_res.rows);
    } catch (err) {
        console.error(err);
        res.status(500)
            .send(err.toString())
    }
}


