WITH RECURSIVE cte_tc as (
	SELECT
		it.name as interface, sr.name as service, tc.name, tc.object_id
	FROM t_object sys
		JOIN t_connector irel ON irel.start_object_id=sys.object_id
		JOIN t_object it ON it.object_id=irel.end_object_id AND it.object_type='Interface'
		JOIN t_connector srel ON srel.start_object_id=it.object_id
		JOIN t_object sr ON sr.object_id=srel.end_object_id
		JOIN t_connector tcr ON tcr.start_object_id=sr.object_id
		JOIN t_object tc ON tc.object_id=tcr.end_object_id AND tc.stereotype='ArchiMate_TechnicalCapability'
	WHERE sys.alias='BEEPAYXP' AND sys.object_type='Component'
),
cte_capability AS (
	SELECT tc.name, tc.object_id, tc.object_id as start_id, tc.object_id as child_id, tc.name::text as context
	FROM cte_tc tc 
	--WHERE tc.object_id in (132701,132766)
	UNION DISTINCT
	SELECT bc.name, bc.object_id, ch.start_id, ch.object_id, ch.context || '/' || bc.name
	FROM cte_capability ch
		JOIN t_connector rel ON rel.end_object_id=ch.object_id AND rel.stereotype='ArchiMate_Aggregation'
		JOIN t_object bc ON bc.object_id=rel.start_object_id AND bc.stereotype='ArchiMate_Capability'
)
SELECT * FROM cte_capability

/*
	FROM t_object tc
		JOIN t_connector rel ON rel.end_object_id=tc.object_id AND rel.stereotype='ArchiMate_Aggregation'
		JOIN t_object bc ON bc.object_id=rel.start_object_id AND bc.stereotype='ArchiMate_Capability'
*/