import React from "react";
import {Routes, Route} from "react-router-dom";
import Main from "./pages/Main/Main";
import Game from "./pages/Game/Game";
import TestGame from "./pages/TestGame/TestGame";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path={"/"} element={<Main />} />
        <Route path={"/game"} element={<Game />} />
        <Route path={"/test-game"} element={<TestGame />} />
      </Routes>
    </div>
  );
}

export default App;
