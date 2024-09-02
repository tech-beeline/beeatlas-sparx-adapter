import './App.css';
import { NavLink } from "react-router-dom";


function App() {
  return (
    <div>
      <header className="App-header">
        <NavLink to="/e2e">Дашборд Е2Е сценариев</NavLink>
        <NavLink to="/systems">Дашборды систем</NavLink>
        <NavLink to="/swagger" target='_blank'>Swagger</NavLink>
      </header>
    </div>
  );
}

export default App;
