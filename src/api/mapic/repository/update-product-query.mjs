export const UPDATE_OR_INSERT_PRODUCT =
    `INSERT INTO mapic.products (
    id, 
    cmdb, 
    load_date )
VALUES (
    $1,$2, NOW() )
ON CONFLICT (id)
DO UPDATE SET load_date=NOW()
RETURNING id,cmdb, load_date;`;

export const UPDATE_OR_INSERT_CAPABILITY =
    `INSERT INTO mapic.capabilities (
    id, product_id, name, status
) VALUES ($1, $2, $3, $4)
ON CONFLICT (id)
DO UPDATE SET status=$3
`;

export const UPDATE_OR_INSERT_API =
    `INSERT INTO mapic.api (
    id, capability_id, status, context
) VALUES ($1, $2, $3, $4)
ON CONFLICT (id)
DO UPDATE SET status=$3, context=$4
`;


export const UPDATE_OR_INSERT_PUBLISHED_API =
    `INSERT INTO mapic.published_api (
    id, api_id, status, context
) VALUES ($1, $2, $3, $4)
ON CONFLICT (id)
DO UPDATE SET status=$3, context=$4
`;