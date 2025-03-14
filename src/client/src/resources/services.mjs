export const apiSystemsPath = (code) => `/api/v4/systems/${encodeURIComponent(code)}?level=methods`;

export const SYSTEM_RESOURCE = '/api/v4/systems';
export const MON_SOURCES_URL = '/api/v4/monitoring/sources';
export const MONITORING_OBJECT_SOURCE_RESOURCE = '/api/v4/monitoring/objects/source';
export const MONITORING_CONTAINER_SOURCE_RESOURCE = '/api/v4/monitoring/containers/source';
export const MONITORING_INTERFACES_SOURCE_RESOURCE = '/api/v4/monitoring/interfaces/source';

export const systemApiMonitoringPath = (code) => `${SYSTEM_RESOURCE}/${code}/monitoring`;