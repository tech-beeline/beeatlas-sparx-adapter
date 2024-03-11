'use strict';
//import DATA from './js/test-data.mjs'

const e = React.createElement;

class TreeTableColumn extends React.Component {
    constructor(props) {
        super(props);
    }
    isCategory() {
        return this.props.def instanceof CategoryColumn;
    }
    render() {
        return <th>{this.props.def.name}</th>
    }
}
class TreeTableHeader extends React.Component {
    constructor(props) {
        super(props);
    }
    get columnsDefinition() {
        return this.props.columns;
    }
    render() {
        return <thead><tr>{this.columnsDefinition.map(c => <th>{c.title ?? c.name}</th>)}
        </tr></thead>
    }
}

class TreeTableRow extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <tr>{
            this.props.columns.map(c => <td>{this.props.data[c.props.def.name]}</td>)
        }</tr>
    }

    //setState()
}
class TreeTableBody extends React.Component {
    constructor(props) {
        super(props);
    }
    renderCell(data, column) {
        if (column.render) {
            return <td>{column.render(data)}</td>
        }
        return <td>{data[column.name]}</td>
    }
    renderCategoryItems(items, columns) {
        if (columns.length === 0) return [];
        if (columns[0] instanceof CategoryColumn) {
            return this.renderCategory(items, columns);
        }
        return items.map(i => {
            return columns.map(c => this.renderCell(i, c));
        })
    }
    /**
     * 
     * @param {Array<{ value, items}>} data 
     * @param {*} columns 
     */
    renderCategory(data, columns) {
        if (columns.length === 0) return [];

        let columns_tail = columns.slice(1);

        let ret = []
        for (const c of columns[0].selector(data)) {
            const category = c.value;
            let items = this.renderCategoryItems(c.items, columns_tail);
            if (items.length === 0) {
                throw Error('not implemented');
            }
            items[0] = [<td rowspan={items.length}>{category}</td>, ...items[0]];
            ret.push(...items);
        }
        console.log(ret);
        return ret;
    }
    render() {
        const columns = this.props.columns;
        if (columns[0] instanceof CategoryColumn) {
            return <tbody>{this.renderCategory(this.props.data, columns).map(r => <tr>{r}</tr>)}</tbody>
        }
        return <tbody>
            {this.props.data.map(r => <tr>{this.renderCategoryItems([r], columns)}</tr>)}
        </tbody>
    }
}

export class TreeTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data : props.data
        }
        this.setData = this.setData.bind(this)
    }
    get columnsDefinition() {
        return this.props.columns.map(
            a => typeof a === "string" ? { name: a } : a
        );
    }

    render() {
        return <table >
            <TreeTableHeader columns={this.columnsDefinition} />
            <TreeTableBody data={this.props.data} columns={this.columnsDefinition} />
        </table>
    }
    setData(data) {
        this.setState({ data: data })
    }
}

export class CategoryColumn {
    selector;
    name;
    #defaultSelector(data) {
        let ret = {};
        for (const item of data) {
            const category = item[this.name];
            ret[category] = ret[category] ?? [];
            ret[category].push(item);
        }
        return Object.entries(ret).map(([key, value]) => ({ value: key, items: value }));
    }
    constructor({ selector, name }) {
        this.name = name;
        this.selector = selector ?? this.#defaultSelector;
    }
}

window.TreeTable = TreeTable;
window.CategoryColumn = CategoryColumn;
/*
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
    console.log( data);
    root.render(<TreeTable data={data} columns={COLUMNS_DEFINITION} />);
})

*/