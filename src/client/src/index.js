import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import App2 from './App2';
import E2EFillingStatus from './Components/e2e-filling-status';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import E2EFillingDetails from './Components/e2e-filling-details.mjs';
import E2EFillingDiagramStatus from './Components/e2e-filling-diagram-status';
import E2EScenario from './Components/e2e-scenario.mjs';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/app2" element={<App2 />} />
      <Route path="/e2e-filling-status" element={<E2EFillingStatus />} />
      <Route path="/e2e-filling-status/:code/details" element={<E2EFillingDetails />} />
      <Route path="/e2e-filling-status/:sequence/details/:diagram" element={<E2EFillingDiagramStatus />} />
      <Route path="/e2e-scenarios/:uid" element={<E2EScenario/>} />

    </Routes>
  </Router>,
  document.getElementById("root")
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

