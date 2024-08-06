import Repository from '../../utils/ea-repo.mjs'


const GRAFANA_SOURCES = `select s.object_id as system_id, s.alias as code,  t.* from 
t_object s
join t_connector r on r.end_object_id=s.object_id and r.connector_type='Realisation'
join t_object gs on gs.object_id=r.start_object_id and gs.stereotype='grafana-source'
join t_objectproperties t on t.object_id=gs.object_id`;

export async function selectGrafanaSources(){
    return Repository.queryRows( GRAFANA_SOURCES );
}