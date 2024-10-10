import fdmStorage from "../fdm-storage.mjs"

const SELECT_TECHNOLOGIES = `SELECT 
    c.name as category_name,
    ring.name as ring_name,
    ring.order as ring_order,
    sector.name as sector_name,
    sector.order as sector_order,
    t.*
FROM techradar.tech t
    JOIN techradar.ring ON ring.id = t.ringid
    JOIN techradar.techcategory  tc ON tc.techid = t.id
    JOIN techradar.category c ON c.id = tc.categoryid
    JOIN techradar.sector ON sector.id = t.sectorid`

export class TechRadarRepository {
    /**
     * 
     * @returns {Promise<Array<{ id, name}>>}
     */
    async selectCategories() {
        return fdmStorage.query("SELECT * FROM techradar.category")
    }

    /**
     * 
     * @returns {Promise<Array<{category_name, category_id, 
     *              sector_name, sector_order, sectorid, 
     *              ring_name, ring_order, ringid,
     *              id, label, description, link, created_date, last_modified_date, deleted_date}>>}
     */
    async selectTechnologies() {
        return fdmStorage.query(SELECT_TECHNOLOGIES);
    }
}

