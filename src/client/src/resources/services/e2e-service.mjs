
export const loadProcessScenarios = async (uid) => {
    //api/v1/e2e-processes/
    const response = await fetch(`/api/v1/e2e-processes/${encodeURIComponent(uid)}/business-interactions`);
    if (response.status !== 200) {
        throw Error(await response.text())
    }
    return response.json();
}
export const loadProcessList = async () => {
    const response = await fetch("/api/v4/e2e");
    if (response.status !== 200) {
        throw Error(await response.text())
    }
    return response.json();
}