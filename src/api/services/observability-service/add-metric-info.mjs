import { MetricSource, SequenceCallDTO } from "../../../client/src/model/sequence.mjs";
import { GrafanaService } from "../../resources/index.mjs";


const grafanaService = new GrafanaService();
/**
 * 
 * @param {MetricSource} target
 * @returns {MetricSource}
 */
async function buildApiMetricTemlate(target) {
    try {
        target.uid = GrafanaService.dashboardUIDFromURL(target.url);

        const dashboard = await grafanaService.getDashboardByUID(target.uid);
        const selectedDatasourceName = GrafanaService.getVariableCurrentValue(dashboard.dashboard, 'DATASOURCE');
        const datasource = await grafanaService.getDatasourceByName(selectedDatasourceName);

        for (const panel of dashboard.dashboard.panels) {
            panel.datasource.uid = datasource.uid;
            for (const target of panel.targets) {
                if (target.datasource.uid === '${DATASOURCE}' || target.datasource.uid === '$DATASOURCE') {
                    target.datasource.uid = datasource.uid;
                }
            }
        }

        target.template = dashboard.dashboard;
        return target;

    } catch (error) {
        console.error(`Ошибка при создании шаблона получения метрик uid="${target.uid}", target=${JSON.stringify(target)}`, error)
    }
}

export async function add_metric_info(sequence, mapic_source_url, method_sources) {
    const metric_sources = {
        MAPIC: new MetricSource(mapic_source_url)
    };
    metric_sources[mapic_source_url] = metric_sources.MAPIC;

    /**
     * 
     * @param {SequenceCallDTO} c 
     */
    function add_source(c) {
        if (c.sequence) {
            c.sequence.forEach(m => {
                m.client_code = c.api?.app_code ?? c.api?.name;
                m.server_code = m.api?.app_code ?? m.api?.name;
                add_source(m);
            });
        }
        if (!c.api) return c;

        /**@type {{api_metric_template:string, code:string, method:string, app_code:string}[]} */
        const call_source = method_sources.filter(s =>
            s.app_code?.toLowerCase() === c.api.app_code?.toLowerCase() &&
            s.method.toLowerCase() === c.method.name?.toLowerCase());
        if (!call_source.length) {
            console.log(`Не найден источник метрик для ${JSON.stringify(c.method)}`);
            return c;
        }

        if (c.stereotype === "via MAPIC") {
            c.metricSource = metric_sources.MAPIC;
        }

        const update_sla = (t, sla) => {
            t.rps = sla.rps;
            t.latency = sla.latency;
            t.error_rate = sla.latency;
            t.sla = { rps: sla.rps, latency: sla.latency, error_rate: sla.error_rate };
            if (!t.metricSource && sla.api_metric_template)
                t.metricSource = metric_sources[sla.api_metric_template] ??
                    (metric_sources[sla.api_metric_template] = new MetricSource(sla.api_metric_template));
        }

        if (call_source.length === 1) {
            update_sla(c, call_source[0]);
            return c;
        }
        if (c.method.uid) {
            const src = call_source.find(m => m.operation_guid == c.method.uid);
            if (src) {
                update_sla(c, src);
                if (src.manual) {
                    // Добавление sla из структурайзера
                    const structurizr_sources = call_source.filter(m => m.manual != 0);
                    if (structurizr_sources.length === 1) {
                        update_sla(c, structurizr_sources[0]);
                    } else {
                        const src_with_sla = structurizr_sources.find(m => m.rpc || m.latency || m.error_rate);
                        if (src_with_sla) {
                            update_sla(c, src_with_sla);
                        }
                    }
                }
                return c;
            }
            /*
            throw Error(`Не найден метод ${c.method.name} с ea_guid=${c.method.uid} в интерфейсе ${c.api.name ?? ""} code=${c.api.interace_code}, cmdb=${c.api.app_code}.
Скорее всего на сообщении стоит не правильный operation_guid. Такое бывает, например, когда у lifeline удаляется/меняется classifier (интерфейс)`);
*/
        }
        //Интерфейс из структурайзера. При этом есть несколько методов с одним названием
        const interface_src = call_source.find(m => m.code?.toLowerCase() === c.api.interace_code?.toLowerCase())
        if (interface_src) {
            update_sla(c, interface_src);
            return c;
        }
    }

    for (const c of sequence.sequence) {
        add_source(c);
    }

    await Promise.all(
        Object.values(metric_sources)
            .map(s => buildApiMetricTemlate(s)
            ));
}