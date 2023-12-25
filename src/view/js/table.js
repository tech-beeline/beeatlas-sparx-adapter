'use strict';
import DATA from './test-data'

const e = React.createElement;

class TreeTableColumn extends React.Component{
    constructor(props) {
        super(props);
    }
    render(){
        return <th></th>
    }
}
class TreeTableHeader extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <thead><tr>
        </tr></thead>
    }
}

class TreeTableBody extends React.Component {
    constructor(props) {
        super(props);
    }
}
class TreeTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <table >
            <TreeTableHeader />
            <TreeTableBody />
        </table>
    }
}

const tableContainer = document.querySelector('#table-id');
const root = ReactDOM.createRoot(tableContainer);

const COLUMNS_DEFINITION = [
    "groupName"
]
root.render(<TreeTable data={DATA} columns={COLUMNS_DEFINITION} />);

console.log(DATA);