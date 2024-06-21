import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DefaultLayout from "./pages/DefaultLayout";
import OrdersListing from "./components/wholesale/OrdersListing";
import ShipStationPage from "./components/retail/ShipStationPage";
import TranshipOrders from "./components/wholesale/TranshipOrders";
import { useState, useEffect } from "react";

import { SnackbarProvider } from "notistack";

import { supabase } from "./supabaseClient";
import { ThemeProvider, useTheme } from "@mui/material/styles";

// import { storage, auth } from "./firebase";
// import { onAuthStateChanged } from "firebase/auth";
//TODO: import firebase.js

function App() {
  const theme = useTheme();
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
              element={session ? <Navigate to="/retail" /> : <Login />}
            />
            <Route
              path="/home"
              element={session ? <DefaultLayout /> : <Navigate to="/" />}
            ></Route>
            <Route
              path="/wholesale"
              element={
                session ? (
                  <DefaultLayout>
                    <OrdersListing />
                  </DefaultLayout>
                ) : (
                  <Navigate to="/" />
                )
              }
            ></Route>
            <Route
              path="/retail"
              element={
                session ? (
                  <DefaultLayout>
                    <ShipStationPage />
                  </DefaultLayout>
                ) : (
                  <Navigate to="/" />
                )
              }
            ></Route>
            <Route
              path="/tranship"
              element={
                session ? (
                  <DefaultLayout>
                    <TranshipOrders />
                  </DefaultLayout>
                ) : (
                  <Navigate to="/" />
                )
              }
            ></Route>
          </Routes>
        </BrowserRouter>
      </div>
    </SnackbarProvider>
  );
}

export default App;
