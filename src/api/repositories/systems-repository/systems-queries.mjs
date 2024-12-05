import { CTE_LANDSCAPE, CTE_SYSTEMS } from "./systems-cte.mjs";

export const SELECT_SYSTEMS = `WITH RECURSIVE ${CTE_LANDSCAPE}
SELECT * FROM cte_landscape`;

export const SELECT_SYSTEM_SUBPACKAGES = `
SELECT
    name, package_id
FROM t_package
WHERE parent_id=$1
  AND name = ANY($2)`;