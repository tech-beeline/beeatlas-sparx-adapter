export const SYSTEM_UID_PREFIX = 'archops-sys-';
export const DEFAULT_FOLDER_UID = "archops";
export const DEFAULT_FOLDER_NAME = "Architecture as a Code";
export const DEFAULT_CSV_CONTENT = "state, name\r\n0, В норме\r\n0.5, В зоне повышенного внимания\r\n1, В зоне реагирования\r\nnull, В источнике нет данных\r\n-1, Мониторинг не реализован\r\n-2, DB";

export const GRAFANA_COLOR_MAPPINGS = [
    {
        options: {
            "0": {
                "color": "green",
                "index": 0,
                "text": "OK"
            },
            "1": {
                "color": "red",
                "index": 1,
                "text": "CRITICAL"
            },
            "-1": {
                "color": "#c9c9c9",
                "index": 4,
                "text": "TBD"
            },
            "-2": {
                "color": "blue",
                "index": 5,
                "text": "DB"
            }
        },
        type: "value"
    },
    {
        options: {
            from: 0,
            to: 1,
            result: {
                "color": "orange",
                "index": 2,
                "text": "WARNING"
            }
        },
        type: "range"
    },
    {
        options: {
            match: "null",
            result: {
                color: "yellow",
                index: 3,
                text: "NO DATA"
            }
        },
        type: "special"
    }
];

export const TEST_DATASOURCE = { type: "testdata", uid: "2nEi5MhSz" };