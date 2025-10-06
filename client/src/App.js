// imports
import React, { useState } from "react";
import "./App.css";
import Game from "./Game";
import Stats from "./Stats";

function App() {
  const [refreshStats, setRefreshStats] = useState(0);

  // called when a game ends - triggers stats refresh
  const handleGameEnd = () => {
    setRefreshStats((prev) => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Number Guessing Game</h1>
        <p>Let's play a game!</p>
      </header>

      <div className="main-content">
        <Game onGameEnd={handleGameEnd} />
        <Stats refresh={refreshStats} />
      </div>

      <footer>
        <p>Builts with React + Node.js + Express</p>
      </footer>
    </div>
  );
}

export default App;
