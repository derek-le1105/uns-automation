import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";

//TODO: import firebase.js

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/home" element={<Home />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
