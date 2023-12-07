import xlsx from 'xlsx'
import oslc from './src/utils/oslc.mjs';
import ENV from './src/env.mjs';
import XMLJS from 'xml-js';
import processDashboardService, { ProcessStatusRow } from './src/services/process-dashboard-service.mjs';
import { sheetFromObject } from './src/utils/excel.mjs';


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
                row => row.operations?.length??""
        },
        {
            name: "Количество участников",
            dontMerge: true,
            data:
                row => row.participiants?.length??""
        }
    ];

    let test = {
        "group" : {
            "base" :{
                "key" : {
                    process: {
                        operations: [ "asdasd"]
                    }
                }
            }
        }
    }

    saveAsExcel(process_status, COLUMN_DEFINITIONS, './data/dashboard-new.xlsx');

    console.log(process_status);
}

dashBoardStatus();