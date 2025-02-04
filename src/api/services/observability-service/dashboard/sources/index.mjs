import { PrometheusApiSource } from "../../../../../legacy/services/monitoring-templates/panels/source-options/prometheus.mjs";
import { OpensearchApiSource } from "./opensearch.mjs";

export class SourceFactory {
    map = {};
    getSource(src) {
        if (this.map[src.source_id])
            return this.map[src.source_id];
        if( OpensearchApiSource.isOpenSearchSource(src.source)) 
            return this.map[src.source_id] = new OpensearchApiSource(src.source);
        if( PrometheusApiSource.IsPrometheusSource(src.source)) 
            return this.map[src.source_id] = new PrometheusApiSource(src.source);
        console.log( src);
    }
}