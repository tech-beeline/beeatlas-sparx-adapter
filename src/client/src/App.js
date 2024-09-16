import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
    E2EFillingDetailsPage,
    E2EFillingDiagramStatusPage,
    E2EFillingStatusPage,
    E2EProcessesPage,
    E2EScenarioPage,
    E2EDashboardMainPage,
    E2EProcessPage,
    E2EProcessesListPage,
    E2EScenarioDashboardPage,
    SystemProcessesPage,
    SystemSearchPage,
    SystemPage,
    SystemE2EParticipionPage,
    MainPage,
} from "./pages/index.mjs";

import "./App.css";
import "./css/e2e-processes.css";
import "./css/e2e-scenario.css";
import "./css/table.css";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route
                    path="/e2e-filling-status"
                    element={<E2EFillingStatusPage />}
                />
                <Route
                    path="/e2e-filling-status/:code/details"
                    element={<E2EFillingDetailsPage />}
                />
                <Route
                    path="/e2e-filling-status/:sequence/details/:diagram"
                    element={<E2EFillingDiagramStatusPage />}
                />
                <Route path="/e2e-processes" element={<E2EProcessesPage />} />
                <Route
                    path="/e2e-scenarios/:uid"
                    element={<E2EScenarioPage />}
                />
                <Route
                    path="/e2e/processes'"
                    element={<E2EDashboardMainPage />}
                />
                <Route
                    path={`/e2e/processes/:uid`}
                    element={<E2EProcessPage />}
                />
                <Route
                    path={`/e2e/processes/:process_uid/bi/:uid`}
                    element={<E2EScenarioDashboardPage />}
                />
                <Route path="/e2e/systems" element={<SystemProcessesPage />} />
                <Route path="/systems" element={<SystemSearchPage />} />
                <Route path="/systems/:code" element={<SystemPage />} />
                <Route
                    path="/systems/:code/e2e"
                    element={<SystemE2EParticipionPage />}
                />
                <Route path="/e2e" element={<E2EProcessesListPage />} />
                <Route path={`e2e/:uid`} element={<E2EProcessPage />} />
                <Route
                    path={`e2e/:process_uid/bi/:uid`}
                    element={<E2EScenarioDashboardPage />}
                />
            </Routes>
        </Router>
    );
}

export default App;
