export const SELECT_PACKAGE_BY_ALIAS =
`SELECT
	p.*
FROM t_object o
	JOIN t_package p ON p.ea_guid=o.ea_guid
WHERE LOWER(o.alias)=LOWER($1) AND object_type='Package'`;