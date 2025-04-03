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
} from "./pages/index.mjs";

import "./App.css";
import "./css/e2e-processes.css";
import "./css/e2e-scenario.css";
import "./css/table.css";
import { WorkspaceCheckResultPage } from "./pages/WorkspaceCheckPage/index.mjs";
import { STRUCTURIZR_CHECK_RESULT } from "./const.mjs";
import { SequencePage } from "./pages/SequencePage/index.mjs";
import { MethodDoublesPage } from "./pages/MethodDoublesPage/index.mjs";

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
                <Route path="/structurizr/check" element={<WorkspaceCheckPage />} />
                <Route path={STRUCTURIZR_CHECK_RESULT} element={<WorkspaceCheckResultPage />} />
                <Route path="/sequence" element={<SequencePage />} />
                <Route
                    path="/maintenance/dbl"
                    element={<MethodDoublesPage />}
                />
            </Routes>
        </Router>
    );
}

export default App;
