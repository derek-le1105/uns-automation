import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import OrdersListing from "./components/wholesale/OrdersListing";
import { useState, useEffect } from "react";

import { SnackbarProvider } from "notistack";

import { supabase } from "./supabaseClient";

// import { storage, auth } from "./firebase";
// import { onAuthStateChanged } from "firebase/auth";
//TODO: import firebase.js

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <SnackbarProvider autoHideDuration={3000}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={session ? <Navigate to="/wholesale" /> : <Login />}
            />
            <Route
              path="/home"
              element={session ? <Home /> : <Navigate to="/" />}
            ></Route>
            <Route
              path="/wholesale"
              element={
                session ? (
                  <Home link={<OrdersListing />} />
                ) : (
                  <Navigate to="/" />
                )
              }
            ></Route>
            <Route
              path="/warehouse"
              element={session ? <Home /> : <Navigate to="/" />}
            ></Route>
            <Route
              path="/history"
              element={session ? <Home /> : <Navigate to="/" />}
            ></Route>
          </Routes>
        </BrowserRouter>
      </div>
    </SnackbarProvider>
  );
}

export default App;
