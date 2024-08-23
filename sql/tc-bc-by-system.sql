WITH RECURSIVE cte_sys AS(
	SELECT object_id
	FROM t_object sys
	WHERE sys.alias='BEEPAYXP' and sys.object_type='Component'
),
cte_sys_pack AS( 
	SELECT
		tcp.package_id
	FROM t_object ro 
		JOIN t_package rp ON rp.ea_guid=ro.ea_guid
		JOIN t_package tcp ON tcp.parent_id=rp.package_id
	WHERE ro.alias='BEEPAYXP' AND object_type='Package'
	UNION ALL
	SELECT c.package_id
	FROM cte_sys_pack p
		JOIN t_package c ON c.parent_id=p.package_id 
),
cte_realization AS ( 
	SELECT DISTINCT r.start_object_id, c.*
    FROM t_connector r 
        JOIN t_object c ON  c.object_id=r.end_object_id
    WHERE r.connector_type='Realisation'),
cte_tc as (
	SELECT DISTINCT
		tc.name, tc.object_id, tc.alias, tc.stereotype
	FROM cte_sys sys
		JOIN t_connector irel ON irel.start_object_id=sys.object_id
		JOIN t_object it ON it.object_id=irel.end_object_id AND it.object_type='Interface'
		JOIN t_connector srel ON srel.start_object_id=it.object_id
		JOIN t_object sr ON sr.object_id=srel.end_object_id
		JOIN t_connector tcr ON tcr.start_object_id=sr.object_id
		JOIN t_object tc ON tc.object_id=tcr.end_object_id AND tc.stereotype='ArchiMate_TechnicalCapability'
	UNION DISTINCT
	SELECT tc.name, tc.object_id, tc.alias as code, tc.stereotype
	FROM cte_sys sys
		JOIN cte_realization c ON c.start_object_id=sys.object_id AND c.object_type='Component' AND c.alias is not null and c.stereotype='C2'
		JOIN cte_realization it ON it.start_object_id=c.object_id AND it.object_type='Interface' AND it.alias is not null AND it.alias <> ''
		JOIN cte_realization tc ON tc.start_object_id=it.object_id AND tc.stereotype='ArchiMate_TechnicalCapability' AND tc.alias is not null AND tc.alias <> ''
	UNION DISTINCT
	SELECT tc.name, tc.object_id, tc.alias, tc.stereotype
	FROM cte_sys_pack p
		JOIN t_object tc ON tc.package_id=p.package_id AND tc.stereotype='ArchiMate_TechnicalCapability' AND tc.alias is not null AND tc.alias <> ''
),
cte_aggregation as (
	SELECT  
		c.object_id as child_id, p.object_id as parent_id
	FROM  t_object c
		JOIN t_package cp ON cp.ea_guid=c.ea_guid
		JOIN t_package pp on pp.package_id=cp.parent_id
		JOIN t_object p ON p.ea_guid=pp.ea_guid AND p.alias is not null
	WHERE c.alias like 'DMN%' or c.alias like 'GRP%'
	UNION
	SELECT end_object_id, start_object_id
	FROM t_connector
	WHERE stereotype='ArchiMate_Aggregation'
),
cte_capability AS (
	SELECT tc.name as tc_name, tc.object_id, tc.object_id as tc_id, tc.object_id as child_id, tc.alias as code, tc.stereotype--, tc.name::text as context
	FROM cte_tc tc 
	UNION DISTINCT
	SELECT bc.name, bc.object_id, ch.tc_id, ch.object_id, bc.alias, coalesce( bc.stereotype, bc.object_type )--, ch.context || '/' || bc.name
	FROM cte_capability ch
		JOIN cte_aggregation rel ON rel.child_id=ch.object_id 
		JOIN t_object bc ON bc.object_id=rel.parent_id AND (bc.stereotype='ArchiMate_Capability' OR bc.object_type='Package')
)
SELECT distinct tc_name, code, object_id, child_id,stereotype FROM cte_capability
ORDER BY tc_name
/*
	FROM t_object tc
		JOIN t_connector rel ON rel.end_object_id=tc.object_id AND rel.stereotype='ArchiMate_Aggregation'
		JOIN t_object bc ON bc.object_id=rel.start_object_id AND bc.stereotype='ArchiMate_Capability'
*/