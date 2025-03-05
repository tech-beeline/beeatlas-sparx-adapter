import { APP_CATALOG_ROOT } from "../../../resources/const.mjs";

export const SELECT_SYSTEM_SUBPACKAGES = `
SELECT
    name, package_id
FROM t_package
WHERE parent_id=$1
  AND name = ANY($2)`;

export const SELECT_SYSTEM_PARTICIPITION = `WITH RECURSIVE
  cte_sys_catalog AS (
    SELECT package_id, package_id AS parent_id, name 
      FROM t_package WHERE ea_guid='${APP_CATALOG_ROOT}'
    UNION DISTINCT
    SELECT c.package_id, p.parent_id, c.name
      FROM cte_sys_catalog p
      JOIN t_package c ON c.parent_id=p.package_id
  ),
  cte_sys AS (
    SELECT sys.name, sys.ea_guid, sys.alias as code, sys.object_id as sys_id
    FROM cte_sys_catalog cat
      JOIN t_object sys ON sys.package_id=cat.package_id AND sys.alias = $1 AND sys.object_type='Component'
  ),
  cte_realization AS ( 
    SELECT DISTINCT r.start_object_id, c.*
      FROM t_connector r 
          JOIN t_object c ON  c.object_id=r.end_object_id
      WHERE r.connector_type='Realisation'),
  cte_sys_obj AS (
      SELECT  sys.name as sys_name, sys.name, sys.code AS sys_code, sys.ea_guid, sys.code, sys.sys_id, sys.sys_id as object_id
      FROM cte_sys sys
      UNION -- Provided interfaces
      SELECT sys.name, it.name, sys.code, it.ea_guid, it.alias, sys.sys_id, it.object_id
      FROM cte_sys sys
          JOIN t_object it ON it.parentid=sys.sys_id AND it.object_type='ProvidedInterface'
      UNION DISTINCT -- containers from structurizr
      SELECT sys.name, c.name, sys.code, c.ea_guid, c.alias, sys.sys_id, c.object_id
      FROM cte_sys sys
          JOIN cte_realization c ON c.start_object_id=sys.sys_id AND c.stereotype='C4_Container'
      UNION DISTINCT -- interfaces from structurizr
      SELECT sys.name, it.name, sys.code, it.ea_guid, it.alias, sys.sys_id, it.object_id
      FROM cte_sys sys
          JOIN cte_realization c ON c.start_object_id=sys.sys_id AND c.stereotype='C4_Container'
          JOIN cte_realization it ON it.start_object_id=c.object_id AND it.object_type='Interface'
  ),
  cte_bi AS (
    SELECT e2e.name as process, e2e.ea_guid as process_uid, bi.name as bi_name, bi.ea_guid as bi_uid, bi.pdata1::integer as bi_id
    FROM t_diagram e2e
      JOIN t_diagramobjects bi_do ON bi_do.diagram_id=e2e.diagram_id
      JOIN t_object bi ON bi.object_id=bi_do.object_id AND bi.object_type='InteractionOccurrence'
    WHERE e2e.stereotype='e2e_diagram'
  ),
  cte_dia_ref AS (
    SELECT od.diagram_id, d.name , d.ea_guid, d.diagram_id AS child_id
    FROM t_xref x
      JOIN t_object o ON o.ea_guid=x.client
      JOIN t_diagram d ON d.ea_guid=x.supplier AND d.diagram_type='Sequence'
      JOIN t_diagramobjects od ON od.object_id=o.object_id AND od.diagram_id <> d.diagram_id
    where x.name='DefaultDiagram'
  ),
  cte_bi_dia AS (
    SELECT bi.process, bi.process_uid, bi.bi_name, bi.bi_uid, bi.bi_id, bi.bi_id as diagram_id, bi.bi_uid as diagram_uid, bi.bi_name as diagram, bi.bi_id as child_id
    FROM cte_bi bi
    UNION DISTINCT
    SELECT bi.process, bi.process_uid, bi.bi_name, bi.bi_uid, bi.bi_id,ref.diagram_id, ref.ea_guid, ref.name, ref.child_id
    FROM cte_bi_dia bi
      JOIN cte_dia_ref ref ON ref.diagram_id=bi.child_id
  ), cte_sys_msg AS (
      SELECT 
          o.sys_code, o.sys_name, o.name as component,
          msg.seqno, msg.name as message, mtd.name as operation, it.name as interface, it.ea_guid as interface_uid, op.value as operation_guid,
          d.*
      FROM cte_bi_dia d
          JOIN t_connector msg ON msg.diagramid=d.diagram_id
          JOIN cte_sys_obj o ON o.object_id=msg.end_object_id
          LEFT JOIN t_connectortag op ON op.elementid=msg.connector_id AND op.property='operation_guid'
          LEFT JOIN t_operation mtd ON mtd.ea_guid=op.value
          LEFT JOIN t_object it ON it.object_id=mtd.object_id
  )
  SELECT * FROM cte_sys_msg`