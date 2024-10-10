import { CTE_SYSTEMS } from "./systems-cte.mjs";

export const SELECT_SYSTEMS = `WITH RECURSIVE ${CTE_SYSTEMS}
SELECT * FROM cte_systems`