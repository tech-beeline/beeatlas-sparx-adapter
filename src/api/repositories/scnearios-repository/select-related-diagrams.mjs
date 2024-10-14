

const cte_diagram_tree =
    `(
	SELECT 
		od.diagram_id,
		o.object_id, 
		d.diagram_id AS child_diagram_id, 
		d.ea_guid AS child_diagram_uid
	FROM t_xref x
		JOIN t_object o ON o.ea_guid=x.client
		JOIN t_diagram d ON d.ea_guid=x.supplier AND d.diagram_type='Sequence'
		JOIN t_diagramobjects od ON od.object_id=o.object_id AND od.diagram_id <> d.diagram_id
	WHERE x.name='DefaultDiagram'
	UNION DISTINCT
	SELECT 
		odd.diagram_id,
		mep.object_id, 
		ref.pdata1::integer, 
		d.ea_guid
	FROM t_object mep 
		JOIN t_object ref ON ref.object_id=mep.parentid
		JOIN t_diagramobjects odd ON odd.object_id = ref.object_id AND odd.diagram_id <> ref.pdata1::integer
		JOIN t_diagram d ON d.diagram_id=ref.pdata1::integer
	WHERE mep.object_type='MessageEndpoint'
),
cte_diagram_tree AS
(
	SELECT 
		diagram_id AS parent_id, 
		diagram_id AS diagram_id, 
		ea_guid AS parent_uid, 
		ea_guid AS diagram_uid, 
		0 as object_id
	FROM t_diagram 
		WHERE diagram_type='Sequence'
	UNION DISTINCT
	SELECT 
		d.parent_id, 
		r.child_diagram_id, 
		d.parent_uid, 
		r.child_diagram_uid, 
		r.object_id
	FROM cte_child_diagram r
		JOIN cte_diagram_tree d ON d.diagram_id=r.diagram_id
)`;


export const SELECT_RELATED_DIAGRAM =
    `WITH RECURSIVE 
${cte_diagram_tree} 
SELECT * FROM cte_diagram_tree
WHERE parent_uid=$1`

