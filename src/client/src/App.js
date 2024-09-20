import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
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
