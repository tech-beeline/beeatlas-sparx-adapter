import logo from './logo.svg';
import './App.css';
import { NavLink } from "react-router-dom";


function App() {
  function clickFn(msg){
    console.log('!!!!!', msg);
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <NavLink to="/e2e-filling-status" target='_blank'>Статус заполнения Е2Е процессов</NavLink>
        <button onClick={clickFn}>Press me</button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
