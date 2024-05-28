import { NotFound, NotImplemented } from "../utils/errors.mjs";
import Repository from "../utils/ea-repo.mjs";
import t_object from "../utils/ea-model/t_object.mjs";
import t_operation from "../utils/ea-model/t_operation.mjs";


class MonitoringService {
    async getInterfaceDashboardManifest(code) {
        const ea_interface = await Repository.first(t_object, { alias: code });
        if (!ea_interface) {
            throw NotFound(`Интерфейс с кодом ${code} не найден`);
        }
        // [ ] Надо уточнить, каким образом сопоставлять с хостом
        /*
        const ea_container = await Repository.queryOne( `select distinct l.name, l.alias as code, o.value as delploy_host
        from t_object i
        join t_connector c on c.end_object_id=i.object_id
        join t_object l on l.object_id=c.start_object_id and connector_type='Realisation' and l.stereotype='C2'
        left join t_objectproperties o on o.object_id=l.object_id and property='delploy_host'
        where i.alias=$1 and i.object_type='Interface'`,[code])
        if( !ea_container ) {
            throw NotFound( `Контейнер для интерфейса ${ea_interface.name} (код=${code}) не найден `);
        }
        if( !ea_container.deploy_host){
            throw NotFound( `Для контейнера ${ea_container.name} не указан deploy_host`);
        }
        console.log( ea_container)
        */
        /**
         * @type {t_operation[]}
         */
        let operations = await Repository.find(t_operation, { object_id: ea_interface.object_id });
        const ret = {
            title: `Дашборд для API ${ea_interface.name}`,
            tags: ["pilot", "generated", "ke=FDMSHOWCASEAPP"], //[ ] Поменять на код продукта
            editable: true,
            rows: operations.map(o => ({
                name: `Метрики ${o.name}`,
                panels: [
                    {
                        timeseries: {
                            title: `Traffic`,
                            datasource : 'logstash-ingress-provider-ia-monitoring',
                            targets: [{
                                opensearch: {
                                    query : `json.request_uri.keyword: ${o.name.split(' ').pop()}`
                                }
                            }]
                        }
                    }
                ]
            }))
        };
        console.log( ret)
        return ret;
    }
}

export default new MonitoringService();