import {
    useParams,
    useSearchParams
} from "react-router-dom";
import {
    useEffect,
    useState
} from "react";
import {
    IconButton,
    Progress,
    Tab,
    Tabs,
    Typography
} from "@beeline/design-system-react";
import {
    Box,
    Link,
    Alert
} from "@mui/material";
import { buildScenarioResourcePath } from "../../resources/services.mjs";

import { ScenarioSequence } from "./components/scenario-sequence.mjs";
import { ScenarioDTO } from "../../model/scenario/index.mjs";
import { ScenarioApplications } from "./components/scenario-applications.mjs";
import { ScenarioObservability } from "./components/scenario-observability.mjs";
import { ScenarioAppBar } from "./components/scenario-app-bar.mjs";
import { loadScenarioSequence } from "../../resources/services/scenario-service.mjs";



const SEQUENCE_TAB = "sequence";
const INTERACTION_TAB = "interaction";
const APPLICATION_TAB = "application"
const OBSERVABILITY_TAB = "observability"
const TAB_INDEX = {
    [SEQUENCE_TAB]: 0,
    [INTERACTION_TAB]: 1,
    [APPLICATION_TAB]: 2,
    [OBSERVABILITY_TAB]: 3
}
const SELECTED_TAB_PARAM = "tab"

export function ScenarioPage() {

    const [searchParams, setSearchParams] = useSearchParams();
    const { process_uid, uid } = useParams();
    const [loadingScenario, setLoadingScenario] = useState();
    const [errorLoad, setErrorLoad] = useState();
    /**@type {[ScenarioDTO]} */
    const [scenario, setScenario] = useState();

    const loadScenario = async () => {
        setErrorLoad(null);
        setLoadingScenario(true);
        setScenario(null);
        try {
            setScenario(await loadScenarioSequence(uid));
        } catch (err) {
            console.error(err);
            setErrorLoad(err.message);
        } finally {
            setLoadingScenario(null);
        }
    }

    useEffect(() => {
        loadScenario();
    }, [process_uid, uid]);

    return (
        <Box>
            <ScenarioAppBar process_uid={process_uid} uid={uid} />
            <Box>
                {loadingScenario && <Progress cycled />}
                {errorLoad && <><Alert severity="error"><IconButton onClick={() => loadScenario()}>Обновить</IconButton>Ошибка при получении данных:{errorLoad}</Alert></>}
                {scenario &&
                    <Tabs selectedTabIndex={TAB_INDEX[searchParams.get(SELECTED_TAB_PARAM)] || 0}>
                        <Tab key={SEQUENCE_TAB} value={SEQUENCE_TAB} label="Дерево вызовов" onClick={() => setSearchParams({ [SELECTED_TAB_PARAM]: SEQUENCE_TAB })}>
                            <ScenarioSequence sequence={scenario.sequence} />
                        </Tab>
                        <Tab key={INTERACTION_TAB} value={INTERACTION_TAB} label="Взаимодействия" onClick={() => setSearchParams({ [SELECTED_TAB_PARAM]: INTERACTION_TAB })}>
                        </Tab>
                        <Tab key={APPLICATION_TAB} value={APPLICATION_TAB} label="Системы и интерфейсы" onClick={() => setSearchParams({ [SELECTED_TAB_PARAM]: APPLICATION_TAB })}>
                            <ScenarioApplications applications={scenario.applications} />
                        </Tab>
                        <Tab key={OBSERVABILITY_TAB} value={OBSERVABILITY_TAB} label="Дашборд наблюдаемости" onClick={() => setSearchParams({ [SELECTED_TAB_PARAM]: OBSERVABILITY_TAB })}>
                            <ScenarioObservability scenarioUID={uid} scenario={scenario} />
                        </Tab>
                    </Tabs>}
            </Box>
        </Box>);
}