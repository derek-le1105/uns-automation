import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import OrdersListing from "./components/wholesale/OrdersListing";
import { useAuthContext } from "./hooks/useAuthContext";

//TODO: import firebase.js

function App() {
  const { user } = useAuthContext();

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/home" /> : <Login />}
          />
          <Route
            path="/home"
            element={user ? <Home /> : <Navigate to="/" />}
          ></Route>
          <Route
            path="/wholesale"
            element={
              user ? <Home link={<OrdersListing />} /> : <Navigate to="/" />
            }
          ></Route>
          <Route
            path="/warehouse"
            element={user ? <Home /> : <Navigate to="/" />}
          ></Route>
          <Route
            path="/history"
            element={user ? <Home /> : <Navigate to="/" />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
