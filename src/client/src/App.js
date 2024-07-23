import logo from './logo.svg';
import './App.css';
import { NavLink } from "react-router-dom";


function App() {
  return (
    <div>
      <header className="App-header">
        <NavLink to="/e2e-filling-status" target='_blank'>Статус заполнения Е2Е процессов</NavLink>
        <NavLink to="/swagger" target='_blank'>Swagger</NavLink>
        <NavLink to="/e2e-processes">Е2Е Процессы (иерархия вызовов)</NavLink>
        <NavLink to="/e2e-scenarios-dashboard">Дашборд Е2Е сценариев</NavLink>
      </header>
    </div>
  );
}

export default App;
