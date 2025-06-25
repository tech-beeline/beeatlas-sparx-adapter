export const SCENARIO_DASHBOARD_PUBLISH_RESOURCE = "/api/v4/observability/scenario/publish";

export const SCENARIO_OBSERVABILITY_RESOURCE = "/api/v4/observability/scenario/"

export const buildScenarioObsPath = (uid) => `${SCENARIO_OBSERVABILITY_RESOURCE}${encodeURIComponent(uid)}`;
