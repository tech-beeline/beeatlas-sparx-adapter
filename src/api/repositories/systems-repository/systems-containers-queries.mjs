import { CTE_REALIZATION } from "./queries/systems-cte.mjs";

export const SELECT_SYSTEM_CONTAINERS = `WITH ${CTE_REALIZATION}
    SELECT
        sys.alias as sys_code,
        sys.name as sys_name,
        cn.alias as code,
        cn.name,
        cn.note as description,
        cn.version,
        cn.status
    FROM t_object sys
        JOIN cte_realization cn ON cn.start_object_id=sys.object_id AND cn.stereotype='C4_Container'
    WHERE sys.object_type='Component'`;

export const SELECT_SYSTEM_CONTAINERS_BY_SYS_CODE = `${SELECT_SYSTEM_CONTAINERS} AND LOWER(sys.alias)=LOWER($1)`