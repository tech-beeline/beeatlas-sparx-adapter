export const GRAFANA_URL = process.env.GRAFANA_URL ?? "https://inside-dev.beeline.ru"
export const GRAFANA_TOKEN = process.env.GRAFANA_TOKEN;
export const GRAFANA_E2E_TEMPLATE_UID = process.env.GRAFANA_E2E_TEMPLATE_UID;

export const FOLDER_API_PATH = "/api/folders"
export const DASHBOARD_API_PATH = "/api/dashboards/db";
export const GET_DASHBOARD_BY_UID_PATH = "/api/dashboards/uid/";
export const GET_DASHBOARDS_PATH = "/api/dashboards";
export const GET_DATASOURCE_BY_NAME_PATH = "/api/datasources/name/";

export const GRAFANA_HTTP_OPTIONS = { headers: { 'Authorization': `Bearer ${GRAFANA_TOKEN}` }, rejectUnauthorized: false };
export const DASHBOARD_UID_REGEXP = new RegExp(`${GRAFANA_URL}/d/(.*)/.*`)
