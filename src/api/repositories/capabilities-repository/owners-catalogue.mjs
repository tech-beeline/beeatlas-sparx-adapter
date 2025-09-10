import { NotImplemented } from '../../../utils/errors.mjs';
import Repository from '../sparx-ea-repository/index.mjs'
import { ARCHIMATE_BUSINESS_ACTOR } from '../sparx-ea-repository/stereotypes/index.mjs';
import { OwnerDTO } from './model.mjs'

const SELECT_OWNERS = `
WITH RECURSIVE cte_owners_catalogue AS (
	SELECT
		p.name, p.package_id
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE stereotype='OwnersCatalogue'
	UNION
	SELECT
		p.name, p.package_id
	FROM cte_owners_catalogue c
		JOIN t_package p ON p.parent_id=c.package_id
)
SELECT 
	o.name, o.object_id
FROM cte_owners_catalogue c
	JOIN t_object o ON o.package_id=c.package_id AND stereotype='ArchiMate_BusinessActor'`;

export class OwnersCatalogue {
    #ownerRootPackage;
    async selectByName(name) {
        const rows = await Repository.query(`${SELECT_OWNERS} WHERE LOWER(o.name)=LOWER($1)`, name);
        return rows.map(r => new OwnerDTO(r));
    }
    /**
     * 
     * @returns {Promise<{ name, package_id }}
     */
    async getOwnerRootPackage() {
        if (!this.#ownerRootPackage) {
            this.#ownerRootPackage = await Repository.queryOne(`SELECT
		p.name, p.package_id
	FROM t_object o
		JOIN t_package p ON p.ea_guid=o.ea_guid
	WHERE stereotype='OwnersCatalogue'
	LIMIT 1`);
        }

        return this.#ownerRootPackage;
    }

    /**
     * 
     * @param {string} name 
     * @returns {Promise<OwnerDTO>}
     */
    async insertOwner(name) {
        console.log(`Влвделец с именем ${name} не найден, добьавляем вледблцеа в каталог владельцев`);
        const root = await this.getOwnerRootPackage();
        if (!root) throw Error(`Не удалось найти каталог владельцев`);
        const ret =  Repository.createObject({ name: name, object_type: ARCHIMATE_BUSINESS_ACTOR, package_id: root.package_id })
        console.log(`Влвдельец ${name} добавлен`);
        return ret;
    }
}

export const ownersRepository = new OwnersCatalogue();