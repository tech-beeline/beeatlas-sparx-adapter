import { Button, Label, Progress, Typography } from "@beeline/design-system-react";
import { Alert, Box, Link } from "@mui/material";
import { useEffect, useState } from "react";
import { buildScenarioObsPath } from "../../../resources/paths/index.mjs";
import later from "../../../utils/later.mjs"
import { publishScenarioDashboard } from "../../../resources/services/index.mjs";

export function ScenarioObservability({ scenarioUID }) {
    const [dashboard, setDashbaord] = useState();
    const [loading, setLoading] = useState();
    const [error, setError] = useState();
    const [publishing, setPublishing] = useState();
    const [publishError, setPublishError] = useState();

    const load = async () => {
        try {
            setDashbaord(null);
            setError(null);
            setLoading(true);
            const response = await fetch(buildScenarioObsPath(scenarioUID));
            if (response.status !== 200) {
                throw Error(await response.text(),);
            }
            setDashbaord(await response.json());
        } catch (err) {
            setError(`Ошибка при запросе информации о дашборде:\n ${err.message}`);
        } finally {
            setLoading(null);
        }
    }
    useEffect(() => {
        load();
    }, [scenarioUID]);

    const publishDashboard = async () => {
        try {
            setPublishing(true);
            setPublishError(null);
            const result = await publishScenarioDashboard(scenarioUID);
            load();
        } catch (error) {
            setPublishError(error.message);
        } finally {
            setPublishing(null);
        }
    }

    return <Box>
        {loading && <Box><Progress cycled shape="linear" />Данные загружатся...</Box>}
        {error && <Alert severity="error"><Button onClick={() => load()}>Обновить</Button>{error}</Alert>}
        {dashboard && <Box>
            <Typography variant="h6">Дата обновления: {dashboard.updated}</Typography>
            <Typography variant="h6">Ссылка на дашборд: <Link href={dashboard.url} target="_blank"> {dashboard.url}</Link></Typography>
            <Typography variant="h6">Папка в графане: {dashboard.folder}</Typography>
            {publishing ?
                <Box>
                    <Typography>
                        Идет публикация дашборда
                    </Typography>
                    <Progress cycled shape="linear" />
                </Box>
                : <Button onClick={publishDashboard}>{!loading && dashboard ? "Обновить дашборд" : "Создать дашборд"}</Button>}
            {publishError && <Alert severity="error">Произша ошибка при публикации дашборда: {publishError}</Alert>}
        </Box>}
    </Box>
}