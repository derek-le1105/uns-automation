import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useLogin = () => {
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    localStorage.setItem("user", JSON.stringify({ email }));
    dispatch({ type: "LOGIN", payload: { email, password } });
  };
  return { login };
};
