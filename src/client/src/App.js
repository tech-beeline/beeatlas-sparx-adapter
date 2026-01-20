import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
    E2EProcessPage,
    E2EProcessesListPage,
    E2EScenarioDashboardPage,
    SystemProcessesPage,
    SystemSearchPage,
    SystemPage,
    MainPage,
    WorkspaceCheckPage,
    SystemChangeLogPage
} from "./pages/index.mjs";

import "./App.css";
import "./css/e2e-processes.css";
import "./css/e2e-scenario.css";
import "./css/table.css";

import '@beeline/design-tokens/css/tokens/globals/index.css';
import '@beeline/design-tokens/css/tokens/themes/light.css';
import '@beeline/design-tokens/css/tokens/themes/dark.css';
import '@beeline/design-tokens/css/iconfont/iconfont.css';
import '@beeline/design-tokens/css/font-face.css';


import { SequencePage } from "./pages/SequencePage/index.mjs";
import { MethodDoublesPage } from "./pages/MethodDoublesPage/index.mjs";
import { DigitalArchitectActionsPage } from "./pages/DigitalArchitectActionsPage/index.mjs";
import { SystemAPIPage } from "./pages/SystemAPIPage/index.mjs";
import { ScenarioPage } from "./pages/ScenarioPage/index.mjs";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/e2e/systems" element={<SystemProcessesPage />} />
                <Route path="/systems" element={<SystemSearchPage />} />
                <Route path="/systems/:code" element={<SystemPage />} />
                <Route path="/e2e" element={<E2EProcessesListPage />} />
                <Route path={`e2e/:uid`} element={<E2EProcessPage />} />
                <Route path={`e2e/:process_uid/bi/:uid`} element={<E2EScenarioDashboardPage />} />
                <Route path={`e2e/:process_uid/scenario/:uid`} element={<ScenarioPage />} />
                <Route path="/sequence" element={<SequencePage />} />
                <Route
                    path="/maintenance/dbl"
                    element={<MethodDoublesPage />}
                />
                <Route
                    path="/digital-architect"
                    element={<DigitalArchitectActionsPage />}
                />
                <Route
                    path="/digital-architect/:login/actions"
                    element={<DigitalArchitectActionsPage />}
                />
                <Route
                    path="/systems/:code/api"
                    element={<SystemAPIPage />}
                />
                <Route
                    path="/systems/:code/change-log"
                    element={<SystemChangeLogPage />}
                />
            </Routes>
        </Router>
    );
}

export default App;
