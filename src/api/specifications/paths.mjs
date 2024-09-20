
//#region capability service paths
export const CAPABILITY_LIST_RESOURCE_V4 = "/api/v4/capabilities";
export const CAPABILITY_RESOURCE_V4 = "/api/v4/capabilities/{code}";
export const CAPABILITY_SEARCH_RESOURCE_V4 = "/api/v4/capability-search"

export const CAPABILITY_LIST_RESOURCE = CAPABILITY_LIST_RESOURCE_V4;
export const CAPABILITY_RESOURCE = CAPABILITY_RESOURCE_V4;
export const CAPABILITY_SEARCH_RESOURCE = CAPABILITY_SEARCH_RESOURCE_V4;

//#region Glosssary paths
export const GLOSSARY_LIST_RESOURCE_V4 = '/api/v4/glossaries';
export const GLOSSARY_LIST_RESOURCE = GLOSSARY_LIST_RESOURCE_V4;
export const GLOSSARY_RESOURCE_V4 = '/api/v4/glossaries/{id}';
export const GLOSSARY_RESOURCE = GLOSSARY_RESOURCE_V4;

export const GLOSSARY_TERM_LIST_RESOURCE_V4 = '/api/v4/glossaries/{id}/terms';
export const GLOSSARY_TERM_LIST_RESOURCE = GLOSSARY_TERM_LIST_RESOURCE_V4;

export const TERM_LIST_RESOURCE_V4 = '/api/v4/glossary-terms';
export const TERM_LIST_RESOURCE = TERM_LIST_RESOURCE_V4;
export const TERM_RESOURCE_V4 = '/api/v4/glossary-terms/{id}';
export const TERM_RESOURCE = TERM_RESOURCE_V4;
//#endregion

//#region technical capability paths
export const TC_SEARCH_RESOURCE_V4 = '/api/v4/tc-search';
export const TC_LIST_RESOURCE_V4 = '/api/v4/tc';
export const TC_RESOURCE_V4 = '/api/v4/tc/{code}';
export const TC_POSITION_RESOURCE_V4 = '/api/v4/tc/{code}/position';

export const TC_SEARCH_RESOURCE = TC_SEARCH_RESOURCE_V4;
export const TC_LIST_RESOURCE = TC_LIST_RESOURCE_V4;
export const TC_RESOURCE = TC_RESOURCE_V4;
export const TC_POSITION_RESOURCE = TC_POSITION_RESOURCE_V4;
//#endregion

//#region  system paths
export const SYSTEM_SEARCH_RESOURCE_V4 = '/api/v4/system-search';
export const SYSTEM_LIST_RESOURCE_V4 = '/api/v4/systems';
export const SYSTEM_RESOURCE_V4 = '/api/v4/systems/{code}';
export const SYSTEM_PURPOSE_RESOURCE_V4 = '/api/v4/systems/{code}/purpose';
export const SYSTEM_E2E_RESOURCE_V4 = '/api/v4/systems/{code}/e2e';
export const SYSTEM_ASSESSMENT_RESOURCE_V4 = '/api/v4/systems/{code}/assessments';

export const SYSTEM_SEARCH_RESOURCE = SYSTEM_SEARCH_RESOURCE_V4;
export const SYSTEM_LIST_RESOURCE = SYSTEM_LIST_RESOURCE_V4;
export const SYSTEM_RESOURCE = SYSTEM_RESOURCE_V4;
export const SYSTEM_PURPOSE_RESOURCE = SYSTEM_PURPOSE_RESOURCE_V4;
export const SYSTEM_E2E_RESOURCE = SYSTEM_E2E_RESOURCE_V4;
export const SYSTEM_ASSESSMENTS_RESOURCE = SYSTEM_ASSESSMENT_RESOURCE_V4;


//#endregion

//#region e2e paths
export const E2E_LIST_RESOURCE_V4 = "/api/v4/e2e";
export const E2E_RESOURCE_V4 = "/api/v4/e2e/{uid}";
export const E2E_LIST_RESOURCE = E2E_LIST_RESOURCE_V4;
export const E2E_RESOURCE = E2E_RESOURCE_V4;

export const E2E_SCENARIO_LIST_RESOURCE = '/api/v4/e2e/{code}/scenarios'
export const E2E_SCENARIO_RESOURCE = '/api/v4/e2e/scenarios/{code}'
export const E2E_SCENARIO_MESSAGES_RESOURCE = '/api/v4/e2e/scenarios/{code}/messages'
export const E2E_SCENARIO_CALL_TREE_RESOURCE = '/api/v4/e2e/scenarios/{code}/call-tree'
export const E2E_SCENARIO_PARTICIPANTS = '/api/v4/e2e/scenarios/{code}/participants'
//#endregion

//#region techradar paths
export const TECH_RADAR_CATEGORY_LIST_RESOURCE_V4 = '/api/v4/tech-radar/categories';
export const TECH_RADAR_TECHNOLOGY_LIST_RESOURCE_V4 = '/api/v4/tech-radar/technologies';
export const TECH_RADAR_CATEGORY_LIST_RESOURCE = TECH_RADAR_CATEGORY_LIST_RESOURCE_V4;
export const TECH_RADAR_TECHNOLOGY_LIST_RESOURCE = TECH_RADAR_TECHNOLOGY_LIST_RESOURCE_V4;

//#endregion