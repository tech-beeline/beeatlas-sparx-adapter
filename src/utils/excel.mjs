import xlsx from 'xlsx'

export class ColumnDefinition {
    name;
    data;
    wch;
    style;
    #columnOptions;
    constructor(c) {
        this.#columnOptions = c;
        this.name = typeof c === 'string' ? c : c.name;
        const data = c.data ?? this.name;
        const data_function = typeof data === 'string' ? (d => d[data]) : d => data(d);
        this.data = c.style ? (d) => {
            let cell_data = data_function(d);
            if (cell_data && typeof cell_data === 'object') {
                return Object.assign({ s: c.style }, cell_data);
            }
            return { t: 's', v: cell_data, s: c.style };
        } : data_function;
        this.wch = c.w ?? 10;
    }

    option(name) {
        return this.#columnOptions[name];
    }
}


/**
 * 
 * @param {*} data 
 * @param {Array} columns 
 * @param {number} rowNum 
 * @param {number} colNum 
 * @returns 
 */
function rowsFromObject(data, columns, rowNum = 1, colNum = 0) {
    const current_column = columns[0]
    if (columns.length == 0) {
        return { rows: [{}], merges: [] }
    }

    let source = Array.isArray(data) ?
        data.map(r => ({ val: current_column.data(r), tail: [r] })) :
        current_column.option('dontMerge') ?
            [{ val: current_column.data(data), tail: [data] }] :
            (Object.entries(data).map(function ([key, val]) {
                return { val: key, tail: val };
            }));

    if (source.length == 0) {
        source = [{ val: "", tail: {} }]
    }

    let row_num = rowNum;
    let ret = { rows: [], merges: [] };
    //TODO Добавить обработку массивов-значений
    for (const { val, tail } of source) {
        let { rows, merges } = rowsFromObject(tail, columns.slice(1), row_num, colNum + 1);

        for (const cell_value of Array.isArray(val) ? val : [val]) {

            ret.rows = ret.rows.concat(rows.map(r => Object.assign({ [current_column.name]: cell_value }, r)));

            ret.merges = ret.merges.concat(merges);
            if (rows.length > 1) {
                ret.merges.push({ s: { c: colNum, r: row_num }, e: { c: colNum, r: row_num + rows.length - 1 } });
            }
            row_num += rows.length;
        }
    }

    return ret;
}

/**
 * 
 * @param {*} data 
 * @param {ColumnDefinition[]} columns 
 * @param {*} options 
 * @returns 
 */
export function sheetFromObject(data, columns, options = {}) {
    let column_defenitions = columns.map(c => new ColumnDefinition(c));
    let { rows, merges } = rowsFromObject(data, column_defenitions);
    let ws = xlsx.utils.json_to_sheet(rows, Object.assign({ header: column_defenitions.map(c => c.name) }, options));
    ws['!cols'] = column_defenitions.map(c => ({ wch: c.wch }));
    ws["!merges"] = merges;
    return ws;
}
