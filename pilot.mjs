import xlsx from 'xlsx'
import oslc from './src/utils/oslc.mjs';

import XMLJS from 'xml-js';
import Repository from './src/utils/ea-repo.mjs'
import processDashboardService, { ProcessStatusRow } from './src/services/process-dashboard-service.mjs';
import { sheetFromObject } from './src/utils/excel.mjs';
import MAPIC from './src/utils/mapic.mjs';
import { mapFromArray } from './src/utils/helpers.mjs';


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

const PROCESS_FOLDER_UID = '{44673B34-2358-4da0-887E-06311EAB7CA2}'

async function createPackage({ alias, name, description, parentResourceIdentifier }) {
    const result = await oslc.createResource({
        alias: alias, name: name, type: "Package", resourceType: "Package", "parentresourceidentifier": parentResourceIdentifier, description: description
    });

    let xml = XMLJS.xml2js(result, { compact: true });
    const about = xml["rdf:RDF"]?.["oslc_am:Resource"]?._attributes["rdf:about"]
    let read_result = await oslc.readResource(about);
    xml = XMLJS.xml2js(read_result, { compact: true });
    return xml["rdf:RDF"]?.["oslc_am:Resource"]?.["dcterms:identifier"]?._text;
}

async function main() {
    let processRefreneceXlsx = xlsx.readFile('./data/Справочник процессов.xlsx')
    let data = xlsx.utils.sheet_to_json(processRefreneceXlsx.Sheets[processRefreneceXlsx.SheetNames[0]])
    let state = {
    };

    let processRefrence = {}

    /**
     * 
     * @param {{processGroup: {mnemonic:string, text:string},
     *  baseProcess: { mnemonic: string, text: string},
     *  keyProcess: { mnemonic: string, text: string},
     *  comment: { mnemonic: string, text: string}
     * }} process 
     */
    function addProcess(process) {
        processRefrence[process.processGroup.text] = processRefrence[process.processGroup.text] ?? { name: process.processGroup.text, mnemonic: process.processGroup.mnemonic, baseProcesses: {} };
        const processGroup = processRefrence[process.processGroup.text];
        if (process.baseProcess) {
            processGroup.baseProcesses[process.baseProcess.text] = processGroup.baseProcesses[process.baseProcess.text] ?? { name: process.baseProcess.text, mnemonic: process.baseProcess.mnemonic, keyProcesses: {} };
            const baseProcess = processGroup.baseProcesses[process.baseProcess.text];
            if (process.keyProcess) {
                baseProcess.keyProcesses[process.keyProcess.text] = baseProcess.keyProcesses[process.keyProcess.text] ?? { name: process.keyProcess.text, mnemonic: process.keyProcess.mnemonic };
                baseProcess.keyProcesses[process.keyProcess.text].comment = process.comment?.text;
                return;
            }
            baseProcess.comment = process.comment?.text;
            return;
        }
        processGroup.comment = process.comment?.text;
    }

    for (const row of data) {
        state.keyProcess = null;
        state.comment = null;
        for (const column in COLUMNS) {
            if (row[COLUMNS[column]]) {
                state[column] = parseMnemonic(row[COLUMNS[column]]);
            }
        }
        addProcess({ ...state });
    }
    console.log(processRefrence)

    for (const process_group_name in processRefrence) {
        const process_group = processRefrence[process_group_name];
        const group_id = await createPackage({ alias: process_group.mnemonic, name: process_group.mnemonic ? `[${process_group.mnemonic}] ${process_group_name}` : process_group_name, parentResourceIdentifier: `pk_${PROCESS_FOLDER_UID}`, description: process_group.comment })
        for (const base_process_name in process_group.baseProcesses) {
            const base_process = process_group.baseProcesses[base_process_name];
            const base_process_uid = await createPackage({
                alias: base_process.mnemonic,
                name: base_process.mnemonic ? `[${base_process.mnemonic}] ${base_process_name}` : base_process_name,
                description: base_process.comment,
                parentResourceIdentifier: group_id
            });
            for (const key_process_name in base_process.keyProcesses) {
                const key_process = base_process.keyProcesses[key_process_name];
                await createPackage({
                    alias: key_process.mnemonic,
                    name: key_process.mnemonic ? `[${key_process.mnemonic}] ${key_process_name}` : key_process_name,
                    description: key_process.comment,
                    parentResourceIdentifier: base_process_uid
                })
            }
        }
    }

    //const new_uid = await createPackage({ alias: '2222', description: "this is description", parentResourceIdentifier : `pk_${PROCESS_FOLDER_UID}`, name : "test"})

    //console.log( new_uid)
}

class ProcessDiagramStatus {
    #name;
    /**
     * @type {ProcessOperation[]}
     */
    operations = [];
    constructor({ baseDiagramName }) {
        this.#name = baseDiagramName;
    }
    get participiants() {
        let ret = {};
        for (const op of this.operations) {
            ret[op.serverCode] = ret[op.serverCode] ?? op.server;
            ret[op.serverCode].server = true;
            ret[op.clientCode] = ret[op.clientCode] ?? op.client;
            ret[op.serverCode].client = true;
        }
        return Object.values(ret);
    }
    get operationsWithName() {
        return this.operations.filter(o => o.name != '');
    }
}

class ProcessOperation {
    /**
     * @type {ProcessStatusRow}
     */
    #row;
    constructor(dbRow) {
        this.#row = dbRow;
    }
    get serverCode() {
        return this.#row.serverCode;
    }
    get server() {
        return { name: this.#row.serverName, code: this.#row.serverCode };
    }
    get clientCode() {
        return this.#row.clientCode;
    }
    get client() {
        return { name: this.#row.clientName, code: this.#row.clientCode };
    }
    get name() {
        return this.#row.operation;
    }

}

function saveAsExcel(data, columns, fileName) {
    let wb = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(wb, sheetFromObject(data, columns));
    xlsx.writeFile(wb, fileName);
}

async function dashBoardStatus() {
    let status_rows = await processDashboardService.getProcessStatusRows();
    let process_status = {}
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

    let test = {
        "group": {
            "base": {
                "key": process_status["[SUPPORT] Обслуживание"]["[TARIF] Смена тарифного плана"]["[MOBILE] Я, как клиент, хочу сменить мобильный тарифный план"]
            }
        }
    }

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
                    provider_row[method_name][process] = { [provider.methods[method_name].sequences[process].ia??""]: {} };
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

//mapic();
