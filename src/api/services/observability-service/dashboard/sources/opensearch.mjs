import { GrafanaApiSource, formatQuery } from "./common.mjs";

const DEFAULT_DATASOURCE = {
    "type": "elasticsearch",
    "uid": "lTk_e61Iz"
};

const DEFAULT_SOURCE = "lTk_e61Iz"
const DEFAULT_SUCCESS_QUERY = 'json.request_uri: "/${uri_regex}/" AND json.request_method: "${method}" AND json.status: [100 TO 299] 404'
const DEFAULT_ERROR_QUERY = 'json.request_uri: "/${uri_regex}/" AND json.request_method: "${method}" AND NOT(json.status: [100 TO 299] 404)'
const DEFAULT_TOTAL_QUERY = 'json.request_uri: "/${uri_regex}/" AND json.request_method: "${method}"'
const DEFAULT_REQUEST_TIME_FIELD = 'json.request_time'

const MAPIC_SOURCE = "ZA4pwY1Sk";
const MAPIC_SUCCESS_QUERY = 'json.host.keyword: "gw.mapic.vimpelcom.ru" AND json.request_uri.keyword: "/${uri_regex}/" AND json.request_method: "${method}" AND json.status: [100 TO 299] 404'
const MAPIC_ERROR_QUERY = 'json.host.keyword: "gw.mapic.vimpelcom.ru" AND json.request_uri.keyword: "/${uri_regex}/" AND json.request_method: "${method}" AND NOT(json.status: [100 TO 299] 404)'
const MAPIC_TOTAL_QUERY = 'json.host.keyword: "gw.mapic.vimpelcom.ru" AND json.request_uri.keyword: "/${uri_regex}/" AND json.request_method: "${method}"'
const MAPIC_REQUEST_TIME_FIELD = DEFAULT_REQUEST_TIME_FIELD;


export const OPENSEARCH_SOURCE_TAG = 'opensearch';
export const OPENSEARCH_API_QUERY_SUCCESS_TAG = 'opensearch-api-query-success';
export const OPENSEARCH_API_QUERY_ERROR_TAG = 'opensearch-api-query-error';
export const OPENSEARCH_API_QUERY_TOTAL_TAG = 'opensearch-api-query-total';
export const OPENSEARCH_REQUEST_TIME_FIELD_TAG = 'opensearch-request-time-field';

export class OpensearchApiSource extends GrafanaApiSource {
    
    constructor(src) {
        super(src);
        this.datasource = {
            type: "elasticsearch",
            uid: this[OPENSEARCH_SOURCE_TAG]
        }
    }
    static isOpenSearchSource(src) {
        return src[OPENSEARCH_SOURCE_TAG] && src[OPENSEARCH_API_QUERY_SUCCESS_TAG] && src[OPENSEARCH_API_QUERY_TOTAL_TAG] && src[OPENSEARCH_API_QUERY_ERROR_TAG] && src[OPENSEARCH_REQUEST_TIME_FIELD_TAG]
    }
    opensearchCountTarget(query, ref) {
        return {
            "bucketAggs": [
                {
                    "field": "@timestamp",
                    "id": "2",
                    "settings": {
                        "interval": "5m"
                    },
                    "type": "date_histogram"
                }
            ],
            datasource: this.datasource,
            hide: true,
            metrics: [
                {
                    id: "1",
                    type: "count"
                }
            ],
            query: query,
            refId: ref,
            timeField: "@timestamp"
        }
    }

    percentileTarget(method, uri, percentile) {
        return {
            bucketAggs: [
                {
                    "field": "@timestamp",
                    "id": "2",
                    "settings": {
                        "interval": "5m"
                    },
                    "type": "date_histogram"
                }
            ],
            datasource: this.datasource,
            hide: true,
            metrics: [
                {
                    field: this[OPENSEARCH_REQUEST_TIME_FIELD_TAG],
                    id: "1",
                    settings: { percents: [percentile] },
                    type: "percentiles"
                }
            ],
            query: formatQuery(this[OPENSEARCH_API_QUERY_SUCCESS_TAG], uri, method),
            refId: `A${percentile}`,
            timeField: "@timestamp"
        }
    }

    totalCountTarget(method, uri) {
        return this.opensearchCountTarget(formatQuery(this[OPENSEARCH_API_QUERY_TOTAL_TAG], uri, method), "B")
    }
    errorCountTarget(method, uri) {
        return this.opensearchCountTarget(formatQuery(this[OPENSEARCH_API_QUERY_ERROR_TAG], uri, method), "C")
    }
}

export const DEFAULT_OPENSEARCH_API_SOURCE = new OpensearchApiSource({
    [OPENSEARCH_SOURCE_TAG]: DEFAULT_SOURCE,
    [OPENSEARCH_API_QUERY_SUCCESS_TAG]: DEFAULT_SUCCESS_QUERY,
    [OPENSEARCH_API_QUERY_ERROR_TAG]: DEFAULT_ERROR_QUERY,
    [OPENSEARCH_API_QUERY_TOTAL_TAG]: DEFAULT_TOTAL_QUERY,
    [OPENSEARCH_REQUEST_TIME_FIELD_TAG]: DEFAULT_REQUEST_TIME_FIELD
});

export const MAPIC_DEFAULT_API_SOURCE = new OpensearchApiSource(
    {
        [OPENSEARCH_SOURCE_TAG]: MAPIC_SOURCE,
        [OPENSEARCH_API_QUERY_SUCCESS_TAG]: MAPIC_SUCCESS_QUERY,
        [OPENSEARCH_API_QUERY_ERROR_TAG]: MAPIC_ERROR_QUERY,
        [OPENSEARCH_API_QUERY_TOTAL_TAG]: MAPIC_TOTAL_QUERY,
        [OPENSEARCH_REQUEST_TIME_FIELD_TAG]: MAPIC_REQUEST_TIME_FIELD
    }
)
