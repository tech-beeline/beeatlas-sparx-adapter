export const SELECT_ALL_SCENARIOS = 
`SELECT DISTINCT 
	odd.diagram_id, 
	d.diagram_id, 
	d.ea_guid as uid, 
	d.name AS name,
	d.version,
	p.ea_guid as process_uid,
	p.name as process_name
FROM t_diagram p
	JOIN t_diagramobjects odd ON odd.diagram_id=p.diagram_id 
	JOIN t_object ref ON ref.object_id=odd.object_id AND ref.object_type='InteractionOccurrence'
	JOIN t_diagram d ON d.diagram_id::text=ref.pdata1
WHERE p.stereotype='e2e_diagram'`;

export const SELECT_E2E_SCENARIOS = `${SELECT_ALL_SCENARIOS} AND p.ea_guid=$1`;