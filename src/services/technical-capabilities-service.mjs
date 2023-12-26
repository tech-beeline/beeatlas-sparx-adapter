import Repository from "../utils/ea-repo.mjs";

const ALL_TC_QUERY =
`with recursive packages as 
(
	select package_id as id, ea_guid, name, name::text as "fullName"
		from t_package 
		where ea_guid='{7889FE97-8783-4311-B229-3A88F8EFA8E3}'
	union
	select cp.package_id, cp.ea_guid, cp.name, p."fullName"::text || '/' || cp.name::text
		from packages p
		join t_package cp on cp.parent_id=p.id
)
select p.ea_guid as pguid, c.ea_guid, p.name as package, c.name, p."fullName" || '/' || c.name as "fullName",
	c.alias as "code", c.note as description, c.author, c.modifieddate as "modifiedDate", c.status
	from packages p
	join t_object c on c.package_id=p.id and c.object_type='Component'`;
    
class TechnicalCapabilityService{
    async getTechnicalCapabilities(){
        return Repository.queryRows( ALL_COMPONENTS_QUERY);
    }
}

export default new TechnicalCapabilityService();