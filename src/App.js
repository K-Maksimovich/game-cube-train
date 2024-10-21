import React from "react";
import {Routes, Route} from "react-router-dom";
import Main from "./pages/Main/Main";
import Game from "./pages/Game/Game";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path={"/"} element={<Main />} />
        <Route path={"/game"} element={<Game />} />
      </Routes>
    </div>
  );
}

export default App;
