'use strict';
//import { TreeTable, CategoryColumn } from './js/table.js'

const e = React.createElement;

const tableContainer = document.querySelector('#table-id');
const root = ReactDOM.createRoot(tableContainer);

const COLUMNS_DEFINITION = [
    new CategoryColumn({ name: "groupName" }),
    new CategoryColumn({ name: "baseProcessName" }),
    new CategoryColumn({ name: "keyProcessName" }), "baseDiagramName", "subDiagramName"
]

root.render(<TreeTable data={[]} columns={COLUMNS_DEFINITION} />);
fetch('/api/process-status').then(async res => {
    let data = await res.json();
    console.log(data);
    root.render(<TreeTable data={data} columns={COLUMNS_DEFINITION} />);
})

