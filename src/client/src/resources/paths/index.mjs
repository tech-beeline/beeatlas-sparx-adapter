export const SCENARIO_DASHBOARD_PUBLISH_RESOURCE = "/api/v4/observability/scenario/publish";

export const SCENARIO_OBSERVABILITY_RESOURCE = "/api/v4/observability/scenario/"
export const SEQUENCE_OBSERVABILITY_RESOURCE = "/api/v4/observability/sequences";

export const buildSequenceObsPath = (uid) => `${SEQUENCE_OBSERVABILITY_RESOURCE}${encodeURIComponent(uid)}`;


export const buildScenarioObsPath = (uid) => `${SCENARIO_OBSERVABILITY_RESOURCE}${encodeURIComponent(uid)}`;

export const GRAFANA_URL = "https://inside.beeline.ru";
export const WEB_EA_URL='https://ms-seaapp001.bee.vimpelcom.ru:83';
export const FDM_URL = 'https://beeatlas.vimpelcom.ru';