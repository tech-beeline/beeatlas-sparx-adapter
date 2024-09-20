import techRadarDataService from "../../data/tech-radar-data-service/index.mjs";
import { TechRadarCategory, TechRadarRing, TechRadarSector, TechRadarTechnology } from "../../model/tech-radar-model.mjs";

class TechRadarService {
    /**
     * @returns {Promise<Array<TechRadarCategory>>}
     */
    async getCategories() {
        return techRadarDataService.selectCategories()
            .then(rows => rows.map(row => new TechRadarCategory(row.id, row.name)))
    }
    /**
     * @returns {Promise<Array<TechRadarTechnology>>}
     */
    async getTechologies() {
        const rows = await techRadarDataService.selectTechnologies();
        return rows.map(row => new TechRadarTechnology(
            row.id,
            row.label,
            row.description,
            row.created_date,
            row.last_modified_date,
            row.deleted_date,
            row.link,
            new TechRadarCategory(row.category_id, row.category_name),
            new TechRadarSector(row.sectorid, row.sector_name, row.sector_order),
            new TechRadarRing(row.ringid, row.ring_name, row.ring_order)));
    }
}

export default new TechRadarService();