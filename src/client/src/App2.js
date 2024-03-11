import logo from './logo.svg';
import './App.css';
import { NavLink } from "react-router-dom";


function App2() {
  function clickFn(msg){
    console.log('!!!!!', msg);
  }
  return (
    <div className="App2">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Ух! Ураган!
          <NavLink to="/">Ту зе рууууут</NavLink>
        </p>
        <button onClick={clickFn}>Press me, please</button>
      </header>
    </div>
  );
}

export default App2;
