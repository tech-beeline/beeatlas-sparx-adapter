import { dateTimeProperty, integerProperty, schemasRef, stringProperty } from "../specifications/helpers.mjs";

export class TechRadarCategory {
    id;
    name;
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export const TECH_RADAR_CATEGORY_SCHEMA = {
    type: "object",
    properties: {
        id: integerProperty("Идентификатор категории"),
        name: stringProperty("Название технологической категории", { example: "Инфраструктура" })
    }
};

export class TechRadarSector {
    id;
    name;
    order;
    constructor(id, name, order) {
        this.id = id;
        this.name = name;
        this.order = order;
    }
}

export class TechRadarRing {
    id;
    name;
    order;
    constructor(id, name, order) {
        this.id = id;
        this.name = name;
        this.order = order;
    }
}

export class TechRadarTechnology {
    id;
    label;
    description;
    created_date;
    last_modified_date;
    deleted_date;
    link;
    category;
    sector;
    ring;

    /**
     * 
     * @param {number} id 
     * @param {string} label 
     * @param {string} description 
     * @param {Date} created_date 
     * @param {Date} last_modified_date 
     * @param {Date} deleted_date 
     * @param {string} link 
     * @param {TechRadarCategory} category 
     * @param {TechRadarSector} sector 
     * @param {TechRadarRing} ring 
     */
    constructor(id, label, description, created_date, last_modified_date, deleted_date, link, category, sector, ring) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.created_date = created_date;
        this.last_modified_date = last_modified_date;
        this.deleted_date = deleted_date;
        this.link = link;
        this.category = category;
        this.sector = sector;
        this.ring = ring;
    }
}

export const TECH_RADAR_TECHNOLOGY_SCHEMA = {
    type: "object",
    properties: {
        id: integerProperty("Идентификатор технологии"),
        label: stringProperty("Название технологии"),
        createdDate: dateTimeProperty("Дата регистрации технологии"),
        deletedDate: dateTimeProperty("Дата удаления технологии из тех. радара"),
        lastModifiedDate: dateTimeProperty("Дата последнего изменения"),
        link: stringProperty("Сссылка на подробное описание технологии"),
        category: schemasRef("TechRadarCategory"),
        sector: {
            type: "object",
            properties: {
                id: integerProperty("Идентификатор сектора"),
                name: stringProperty("Название сектора"),
                order: integerProperty("Порядок")
            }
        },
        ring: {
            type: "object",
            properties: {
                id: integerProperty("Идентификатор"),
                name: stringProperty("Название"),
                order: integerProperty("Порядок")
            }
        },

    }
}