import { SCENARIO_DASHBOARD_PUBLISH_RESOURCE } from "../paths/index.mjs";

export const publishScenarioDashboard = async (scenarioUID) => {
    const response = await fetch(SCENARIO_DASHBOARD_PUBLISH_RESOURCE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            uid: scenarioUID
        })
    });
    
    if (response.status !== 200) throw Error(await response.text());
    return response.json();
};