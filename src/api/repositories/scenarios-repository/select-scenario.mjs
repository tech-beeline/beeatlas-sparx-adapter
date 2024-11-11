export const SELECT_SCENARIO_BY_UID = 
`SELECT
    diagram_id,
    ea_guid AS uid,
    name,
    notes as description,
    version,
    author
FROM t_diagram
WHERE ea_guid=$1`;
