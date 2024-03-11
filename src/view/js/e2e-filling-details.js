'use strict';
//import { TreeTable, CategoryColumn } from './js/table.js'

const e = React.createElement;

const tableContainer = document.querySelector('#note-off');
const root = ReactDOM.createRoot(tableContainer);

let row_col = 0;
const COLUMNS_DEFINITION = [
    { title: "№", render: () => ++row_col },
    { title: "Е2Е Процесс", name: "sequence" },
    { title: "Диаграмма", render: (row) => <a href={`https://ms-seaapp001.bee.vimpelcom.ru:83?m=1&o=${row.diagram_uid}`} target="_blank">{row.diagram}</a> },
    { title: "Не включены заметки", render: (row) => row.note_off ? <b><font color="red">Выключены</font></b> : <font color="green">Включены</font> },
    /*new CategoryColumn({ name: "baseProcessName" }),
    new CategoryColumn({ name: "keyProcessName" }), "baseDiagramName", "subDiagramName"*/
]

let note_off_details = <TreeTable data={[]} columns={COLUMNS_DEFINITION} />

root.render(<div><div>Детальная информация о включенных заметках на диаграммах</div>{note_off_details}</div>);

fetch(`/api/process-filling/${location.pathname.split('/').at(-2)}/details`).then(async res => {
    let data = await res.json();
    note_off_details.setData({ data: data });
})

