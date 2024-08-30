import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import E2EFillingStatus from './Components/e2e-filling-status';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import E2EFillingDetails from './Components/e2e-filling-details.mjs';
import E2EFillingDiagramStatus from './Components/e2e-filling-diagram-status';
import E2EScenario from './Components/e2e-scenario.mjs';
import E2EProcesses from './Components/e2e-processes';
import E2EScenarioDashboard, { E2EScenarioDashboard_URI } from './Components/dashboards/e2e-process/e2e-scenarios-page.mjs';
import E2EDashboardMainPage, { E2EDashboardMainPage_URI } from './Components/dashboards/e2e-process/scenarios-main-page.mjs';
import E2EProcessSummary, { E2EProcessSummary_URI } from './Components/dashboards/e2e-process/e2e-process-page.mjs';
import SystemProcesses from './Components/system-processes.mjs';
import SearchSystemPage from './Components/dashboards/system/search-system-page.mjs';
import SystemPage from './Components/dashboards/system/system-page.mjs';
import SystemE2EParticipionPage from './Components/dashboards/system/system-e2e.mjs';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/e2e-filling-status" element={<E2EFillingStatus />} />
      <Route path="/e2e-filling-status/:code/details" element={<E2EFillingDetails />} />
      <Route path="/e2e-filling-status/:sequence/details/:diagram" element={<E2EFillingDiagramStatus />} />
      <Route path="/e2e-processes" element={<E2EProcesses/>} />
      <Route path="/e2e-scenarios/:uid" element={<E2EScenario/>} />
      <Route path={E2EDashboardMainPage_URI} element={<E2EDashboardMainPage/>} />
      <Route path={`${E2EProcessSummary_URI}/:uid`} element={<E2EProcessSummary/>} />
      <Route path={`${E2EProcessSummary_URI}/:process_uid/bi/:uid`} element={<E2EScenarioDashboard/>} />
      <Route path='/e2e/systems' element={<SystemProcesses/>} />
      <Route path='/systems' element={<SearchSystemPage/>} />
      <Route path='/systems/:code' element={<SystemPage/>} />
      <Route path='/systems/:code/e2e' element={<SystemE2EParticipionPage/>} />
      <Route path='/e2e' element={<E2EDashboardMainPage/>}/>
    </Routes>
  </Router>
)
/*
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
*/
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

