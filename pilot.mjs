import xlsx from 'xlsx'
import oslc from './src/utils/oslc.mjs';

import XMLJS from 'xml-js';
import Repository from './src/utils/ea-repo.mjs'
import processDashboardService from './src/services/e2e-process-serivce.mjs';
import { sheetFromObject } from './src/utils/excel.mjs';
import MAPIC from './src/utils/mapic.mjs';
import { mapFromArray } from './src/utils/helpers.mjs';
import Capability from './src/model/capability.mjs';
import CAPABILITY_EXAMPLES from './src/swagger/examples/capability-examples.mjs';
import SwaggerDefinition from './src/routes/swagger.mjs';
import QUERIES from './src/services/sql/e2e-process-queries.mjs'
import applicationService from './src/services/application-service.mjs';



const COLUMNS = {
    processGroup: "[Мнемоника] Группа процессов",
    baseProcess: "Базовый процесс",
    keyProcess: "Ключевой процесс",
    comment: "Комментарий"
}

/**
 * 
 * @param {string} text 
 * @return { {mnemonic: string, text: string}}
 */
function parseMnemonic(text) {
    text = text.trimStart().trimEnd();
    if (text.startsWith('[')) {
        const mnemonic_ends = text.indexOf(']');
        if (mnemonic_ends >= 0) {
            return { mnemonic: text.substring(1, mnemonic_ends), text: text.substring(mnemonic_ends + 1).trimStart() }
        }
    }
    return { mnemonic: "", text: text };
}


function saveAsExcel(data, columns, fileName) {
    let wb = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(wb, sheetFromObject(data, columns));
    xlsx.writeFile(wb, fileName);
}

async function dashBoardStatus() {

    let status_rows = await Repository.queryRows(QUERIES.E2E_PROCESSES_QUERY);
    const app_catalog = await applicationService.getApplications();


    for (let process of status_rows) {
        process.systems = {};
        let msg_list = await Repository.queryRows( QUERIES.E2E_MESSAGES_QUERY, [process.ea_guid] );
        for( let msg of msg_list ){
            const client = app_catalog.byObjectId( msg.client_id);
            if( client?.cmdb)
                process.systems[ client.cmdb] = `[${client.cmdb}] ${client.name}`
            const  server = app_catalog.byObjectId( msg.server_id);

            if( server?.cmdb)
                process.systems[ server.cmdb] = `[${server.cmdb}] ${server.name}`
        }
    }

    const COLUMN_DEFINITIONS_SYSTEMS = [
        {
            name: "Группа процессов", w: 25, data : r=>r.group_name
        },
        {
            name: "Базовый процесс", w: 35, data : r=>r.base_process
        },
        {
            name: "Ключевой процесс", w: 50, data : r=>r.key_process
        },
        {
            name: "Процесс", w: 50, data : r=>r.diagram
        },
        {
            name: "systems", w: 50
        }
    ];



    let process_status = status_rows.map( r=>Object.assign(r,{ systems : Object.values( r.systems).join(',')}))

    saveAsExcel(process_status, COLUMN_DEFINITIONS_SYSTEMS, './data/dashboard-new.xlsx');
    return;

    for (let row of status_rows) {
        process_status[row.groupName] = process_status[row.groupName] ?? {};//{ name: row.groupName }
        let group = process_status[row.groupName];
        group[row.baseProcessName] = group[row.baseProcessName] ?? { /*name: row.baseProcessName*/ };
        let base_process = group[row.baseProcessName];
        if (row.keyProcessName) {
            base_process[row.keyProcessName] = base_process[row.keyProcessName] ?? { /* name: row.keyProcessName*/ };
            let key_proc = base_process[row.keyProcessName];
            if (row.baseDiagramName) {
                key_proc[row.baseDiagramName] = key_proc[row.baseDiagramName] ?? new ProcessDiagramStatus(row);
            }
            let process = key_proc[row.baseDiagramName];
            if (row.operation) {
                process.operations.push(new ProcessOperation(row));
            };
        }
    }
    const COLUMN_DEFINITIONS = [
        {
            name: "Группа процессов", w: 25
        },
        {
            name: "Базовый процесс", w: 35
        },
        {
            name: "Ключевой процесс", w: 50
        },
        {
            name: "Процесс", w: 50
        },
        {
            name: "Общее количество операций",
            dontMerge: true,
            data:
                row => row.operations?.length ?? ""
        },
        {
            name: "Из них интеграций",
            dontMerge: true,
            data:
                row => row.operations?.filter(o => o.serverCode && o.clientCode && o.name.toLowerCase() !== 'use').length ?? ""
        },
        {
            name: "Количество участников",
            dontMerge: true,
            data:
                row => row.participiants?.length ?? ""
        },
        {
            name: "ИЗ них систем",
            dontMerge: true,
            data:
                row => row.participiants?.filter(p => p.code).length ?? ""
        }
    ];

    saveAsExcel(process_status, COLUMN_DEFINITIONS, './data/dashboard-new.xlsx');

    console.log(process_status);
}

function getMethods(openapi) {
    try {
        let ret = {};
        let spec = JSON.parse(openapi);
        for (const path in spec.paths) {
            for (const method in spec.paths[path]) {
                ret[`${method.toLowerCase()} ${path.toLowerCase()}`] = spec.paths[path][method];
            }
        }
        return ret;
    } catch (error) {
        return {}
    }
}


const SEQUENCE_QUERY =
    `WITH RECURSIVE pkgs(parent_id, package_id, ea_guid, parent_guid) AS (
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
d.name as process, d.ea_guid as duid, 
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
      order by d.diagram_id, msg.seqno`;

async function mapic() {
    let mapic_api = await MAPIC.connect("https://stage.mapic-dev.vimpelcom.ru", 'ivvoronin', "urs2BEEline_");
    let products = await mapic_api.products();
    let product_map = mapFromArray(products, d => d.id)
    //console.log( product_map);
    let integration_map = {};
    for (const product of products.filter(p => !p.cmdbUnit.startsWith('AUTOTEST'))) {
        for (const subscription of (await mapic_api.productSubscriptions(product.id))) {
            if (subscription.statusName !== 'Active')
                continue;
            let publishedApi = await mapic_api.publishedApi(subscription.publishedApiId);
            let api = await mapic_api.Api(publishedApi.apiId);
            let spec = await mapic_api.apiSpecification(api.id);
            let capability = await mapic_api.capability(api.capabilityId);
            let provider_product = product_map[capability.productId]

            let consumer = integration_map[product.cmdbUnit] = integration_map[product.cmdbUnit] ?? { consumer: product, integration: {} };
            consumer.integration[provider_product.cmdbUnit] = consumer.integration[provider_product.cmdbUnit] ?? { provider: provider_product, methods: getMethods(spec) }

            //console.log(spec);
        }
    }

    let ea_rows = (await Repository.queryRows(SEQUENCE_QUERY))
        .filter(r => r.method && r.operation && r.operation != "" && r.srv_type == "ProvidedInterface" && r.consumer_code && r.supplier_code);

    for (const ea_row of ea_rows) {
        let consumer = integration_map[ea_row.consumer_code] = integration_map[ea_row.consumer_code] ?? { consumer: { cmdbUnit: ea_row.consumer_code, name: ea_row.consumer }, integration: {} };
        let provider = consumer.integration[ea_row.supplier_code] = consumer.integration[ea_row.supplier_code] ?? { provider: { cmdbUnit: ea_row.supplier_code, name: ea_row.supplier }, methods: {} }
        let method = provider.methods[ea_row.operation.toLowerCase()] = provider.methods[ea_row.operation.toLowerCase()] ?? {};
        method.sequences = method.sequences ?? {}
        let process = method.sequences[ea_row.process] = method.sequences[ea_row.process] ?? { ia: ea_row.ia };
    }

    let excel_data = {}
    for (const consumer in integration_map) {
        let consumer_row = excel_data[consumer] = excel_data[consumer] ?? {};
        consumer_row = consumer_row[integration_map[consumer].consumer.name] = consumer_row[integration_map[consumer].consumer.name] ?? {};
        for (const provider_cmdb in integration_map[consumer].integration) {
            let provider = integration_map[consumer].integration[provider_cmdb];
            let provider_row = consumer_row[provider_cmdb] = consumer_row[provider_cmdb] ?? {};
            provider_row = provider_row[provider.provider.name] = provider_row[provider.provider.name] ?? {};
            for (const method_name in provider.methods) {
                provider_row[method_name] = provider_row[method_name] ?? {};
                for (const process in provider.methods[method_name].sequences ?? []) {
                    provider_row[method_name][process] = { [provider.methods[method_name].sequences[process].ia ?? ""]: {} };
                }
            }
        }
    }

    let wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(
        wb, sheetFromObject(excel_data,
            [
                { name: "CMDB Потребителя" }, { name: "Имя потребителя", w: 25 },
                { name: "CMDB Поставщика" }, { name: "Имя поставщика", w: 25 },
                { name: "Метод API", w: 30 }, { name: "E2E процесс", w: 50 },
                { name: "ИНтерфейсное соглашение", w: 50 }
            ]));

    xlsx.writeFile(wb, './dump/integration-map.xlsx');

    console.log('!');
}
//dashBoardStatus();

console.log('!')
//mapic();
dashBoardStatus()