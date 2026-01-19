export const SELECT_SCHEMA_TABLE = `
SELECT
    *
FROM information_schema."tables"
WHERE table_name=$1
	AND table_schema=$2`;

export const APPLICATION_CATALOGUE_STEREOTYPE = 'ApplicationCatalogue';
export const BC_CATALOGUE_STEREOTYPE = 'BusinessCapabilitiesCatalogue';
export const TC_CATALOGUE_STEREOTYPE = `TechCapabilitiesCatalogue`
export const E2E_CATALOGUE_STEREOTYPE = 'E2EProcessCatalogue';


export const CATALOGUES = {
	[APPLICATION_CATALOGUE_STEREOTYPE]: "Application Catalogue",
	[BC_CATALOGUE_STEREOTYPE]: "Business Capability Catalogue",
	[TC_CATALOGUE_STEREOTYPE]: "Technical Capability Catalogue",
	[E2E_CATALOGUE_STEREOTYPE]: "E2E Process Catalogue"
};

export const CATALOGUES_ALIAS = {
	[BC_CATALOGUE_STEREOTYPE]: "GRP.000"
};

export const CATALOGUE_STEREOTYPES = Object.keys(CATALOGUES);

export const SELECT_FDM_OBJECTS = `
SELECT
	object_id, ea_guid, name, stereotype
FROM t_object 
WHERE stereotype  IN (${CATALOGUE_STEREOTYPES.map(s => `'${s}'`).join(',')})`;

export const SELECT_FMD_MODEL = `SELECT * FROM t_package WHERE name='FDM Model'`;

export const SELECT_MIGRATION_HISTORY = `SELECT * FROM arch_metrics.migration_history ORDER BY migration_date DESC`;