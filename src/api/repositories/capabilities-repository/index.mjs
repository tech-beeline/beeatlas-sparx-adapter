import Repository from '../sparx-ea-repository/index.mjs'

const SELECT_ALL =
	`with recursive capabilities as (
	select
		p.object_id as id,
		d.alias as code,
		d.name as name, 
		true as "isDomain",
		d.descr as description,
		po.alias as "parent", 
		po.name  as parent_name,
		true as "isParentDomain",
		d.owner,
		p.author, 
		p.status, 
		p.createddate as "createdDate", 
		p.modifieddate as "modifiedDate",
		p.ea_guid,
		p.package_id
	from v_domains d
		inner join t_object p on p.ea_guid=d.ea_guid
		left join  t_package parent on parent.package_id=d.parent_id
		left join  t_object po on po.ea_guid=parent.ea_guid
	union
	select 
		cap.object_id,
		cap.alias,
		cap.name,
		false as "isDomain",
		cap.note,
		p.code as parentCode,
		p.name as parent_name,
		p."isDomain",
		coalesce((SELECT DISTINCT obe.name
                   FROM t_connector co,
                    t_object obe
                  WHERE co.end_object_id = cap.object_id AND obe.object_id = co.start_object_id AND co.stereotype = 'Responsibility' 
		 			AND obe.stereotype = 'ArchiMate_BusinessActor' limit 1), p.owner ),
		cap.author,
		cap.status,
		cap.createddate,
		cap.modifieddate,
		cap.ea_guid,
		cap.package_id
	from t_connector rel
		join capabilities p on p.id=rel.start_object_id and rel.stereotype='ArchiMate_Aggregation'
		join t_object cap on cap.object_id=rel.end_object_id and cap.stereotype='ArchiMate_Capability'
        where cap.alias is not null
)
select * from capabilities`

const SELECT_BY_CODE = `${SELECT_ALL} where code=$1`;
const SEARCH_BY_NAME = `${SELECT_ALL} WHERE name LIKE ANY ($1)`

export class CapabilitiesRepository {
	async selectAll() {
		return Repository.queryRows(SELECT_ALL)
	}

	async searchByName(terms) {
		const termsArray = Array.isArray(terms) ? terms.map(t => `%${t}%`) : [`${terms}`]
		return Repository.queryRows(SEARCH_BY_NAME, [termsArray]);
	}

	/**
	 * 
	 * @param {string} code Код возможности
	 * @returns 
	 */
	async selectByCode(code) {
		return Repository.queryOne(SELECT_BY_CODE, [code]);
	}
}

