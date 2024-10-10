'use strict';
//import { TreeTable, CategoryColumn } from './js/table.js'

const e = React.createElement;

const tableContainer = document.querySelector('#table-id');
const root = ReactDOM.createRoot(tableContainer);

let row_col = 0;
const COLUMNS_DEFINITION = [
    { title: "№", render: () => ++row_col },
    { title: "Е2Е Процесс", render: (row) => <a target="_blank" href={`${location.href}${row.href}`}>{row.sequence}</a> },
    { title: "Не включены заметки", name: "diagrams_notes_off" },
    { title: "Количество компонент", name: "total_components" },
    { title: "Количество компонент не из каталога", name: "components_not_from_catalog" },
    { title: "Взаимодействий между компонентами", name: "total_interaction" },
    { title: "Взаимодействия не из интерфейса", name: "operations_not_specified" },
    { title: "Взаимодействия без IA", name: "operations_without_ia" }
    /*new CategoryColumn({ name: "baseProcessName" }),
    new CategoryColumn({ name: "keyProcessName" }), "baseDiagramName", "subDiagramName"*/
]

root.render(<TreeTable data={[]} columns={COLUMNS_DEFINITION} />);
fetch('/api/process-filling').then(async res => {
    let data = await res.json();
    console.log(data);
    root.render(<TreeTable data={data} columns={COLUMNS_DEFINITION} />);
})

