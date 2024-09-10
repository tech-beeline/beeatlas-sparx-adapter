// Caapbility service paths
export const CAPABILITY_LIST_RESOURCE_V4 = "/api/v4/capabilities";
export const CAPABILITY_RESOURCE_V4 = "/api/v4/capabilities/{code}";

export const CAPABILITY_LIST_RESOURCE = CAPABILITY_LIST_RESOURCE_V4;

//#region Glosssary paths
export const GLOSSARY_LIST_RESOURCE_V4 = '/api/v4/glossaries';
export const GLOSSARY_LIST_RESOURCE = GLOSSARY_LIST_RESOURCE_V4;
export const GLOSSARY_RESOURCE_V4 = '/api/v4/glossaries/{id}';
export const GLOSSARY_TERM_LIST_RESOURCE_V4 = '/api/v4/glossaries/{id}/terms';

export const TERM_LIST_RESOURCE_V4 = '/api/v4/glossary-terms';
export const TERM_LIST_RESOURCE = TERM_LIST_RESOURCE_V4;
export const TERM_RESOURCE_V4 = '/api/v4/glossary-terms/{id}';
//#endregion

//#region  system paths
export const SYSTEM_LIST_RESOURCE_V4 = '/api/v4/systems';
export const SYSTEM_ASSESSMENT_RESOURCE_V4 = '/api/v4/systems/{code}/assessments';
export const SYSTEM_ASSESSMENT_RESOURCE = SYSTEM_ASSESSMENT_RESOURCE_V4;
export const SYSTEM_LIST_RESOURCE = SYSTEM_LIST_RESOURCE_V4;
//#endregion