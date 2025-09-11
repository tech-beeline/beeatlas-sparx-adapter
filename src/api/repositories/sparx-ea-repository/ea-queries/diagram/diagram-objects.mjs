export const INSERT_DIAGRAMOBJECTS = `
WITH cte_obj AS (
	SELECT * 
	FROM json_to_recordset($2::json) 
		AS (object_id int, rectleft int, rectright int, recttop int, rectbottom int) 
)
INSERT INTO t_diagramobjects(
	diagram_id,
	object_id, 
	rectleft,
	rectright,
	recttop,
	rectbottom)
SELECT 
	$1,
	object_id,
	rectleft,
	rectright,
	recttop,
	rectbottom
FROM cte_obj o
WHERE o.object_id NOT IN (
	SELECT object_id FROM t_diagramobjects WHERE diagram_id=$1)
`;

export const UPDATE_DIAGRAMOBJECT  =`
WITH cte_obj AS (
	SELECT * 
	FROM json_to_recordset($2::json) 
		AS (object_id int, rectleft int, rectright int, recttop int, rectbottom int) 
)
UPDATE t_diagramobjects 
SET
	rectleft=cte_obj.rectleft,
	rectright=cte_obj.rectright,
	recttop=cte_obj.recttop,
	rectbottom=cte_obj.rectbottom
FROM cte_obj
WHERE diagram_id=$1 AND t_diagramobjects.object_id=cte_obj.object_id
`;