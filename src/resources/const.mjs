import packageJson from '../../package.json' with { type: "json" };


export const API_VERSION = packageJson.version;
export const CONTACT = {
    "email": "ivvoronin@beeline.ru"
}

export const APP_CATALOG_ROOT = process.env.APP_CATALOG_ROOT ?? '{7889FE97-8783-4311-B229-3A88F8EFA8E3}';


export const SOURCE_LIST_RESOURCE = '/api/v4/monitoring/sources';
export const SYSTEM_SOURCE_RESOURCE = '/api/v4/monitoring/systems/{code}/source';
export const SYSTEM_OBJECTS_RESOURCE = '/api/v4/monitoring/objects/source';
export const CONTAINER_SOURCE_RESOURCE = '/api/v4/monitoring/containers/source';
export const INTERFACE_SOURCE_RESOURCE = '/api/v4/monitoring/interfaces/source';
export const STRUCTURIZR_JSON_CHECK_RESOURCE = "/api/v4/structirizr/{id}/json-check";
export const FDM_PRODUCT_RESOURCE = "/api/v4/fdm/products/{code}";