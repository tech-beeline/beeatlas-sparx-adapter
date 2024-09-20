import techRadarControllers from "../controllers/tech-radar-controllers.mjs";
import { TECH_RADAR_CATEGORY_SCHEMA, TECH_RADAR_TECHNOLOGY_SCHEMA } from "../model/tech-radar-model.mjs";
import { GetJSONOperation, SimpleServiceSpecification, arraySchema, booleanProperty, buildServiceSwagger, dateTimeProperty, integerProperty, schemasRef, stringProperty } from "./helpers.mjs"
import { TECH_RADAR_CATEGORY_LIST_RESOURCE, TECH_RADAR_TECHNOLOGY_LIST_RESOURCE } from "./paths.mjs";

const TECH_RADAR_SERVICE_NAME = "Управление информацией о технологиях"
const TECH_RADAR_SERVICE_DESCRIPTION = "Управление информацией о технологиях, используемых в компании"

const GET_CATEGORIES_SUMMARY = "Получение списка технологических категорий";
const GET_TECHOLOGIES_SUMMARY = "Получение списка технологий";

const SWAGGER = new SimpleServiceSpecification(TECH_RADAR_SERVICE_NAME, TECH_RADAR_SERVICE_DESCRIPTION);

//#region techradar entities schemas
const TECH_RADAR_CATEGORY_SCHEMA_REF = SWAGGER.defineEntitySchema("TechRadarCategory", TECH_RADAR_CATEGORY_SCHEMA);
const TECH_RADAR_TECHNOLOGY_SCHEMA_REF = SWAGGER.defineEntitySchema("TechRadarTechnology", TECH_RADAR_TECHNOLOGY_SCHEMA);
//#endregion

SWAGGER
    .defineGet(TECH_RADAR_CATEGORY_LIST_RESOURCE, new GetJSONOperation(GET_CATEGORIES_SUMMARY, null, arraySchema(TECH_RADAR_CATEGORY_SCHEMA_REF), techRadarControllers.getCategories))
    .defineGet(TECH_RADAR_TECHNOLOGY_LIST_RESOURCE, new GetJSONOperation(GET_TECHOLOGIES_SUMMARY, null, arraySchema(TECH_RADAR_TECHNOLOGY_SCHEMA_REF), techRadarControllers.getTechnologies));

export default SWAGGER;
