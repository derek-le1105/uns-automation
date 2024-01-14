import { useState } from "react";

import {
  Box,
  Stack,
  TextField,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@mui/material/";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { supabase } from "../supabaseClient";

import { useTheme } from "@mui/material/styles";

const Login = () => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.error_description || error.message);
    }
    setLoading(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <div className="pages">
      <Box
        sx={{
          border: `1px solid ${theme.palette.primary.main}`,
          borderRadius: "5px",
          padding: "25px",
        }}
      >
        <Stack
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "25ch" },
          }}
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <h3 className="mb-3">Administrator Log In</h3>
          <TextField
            required
            id="outlined-required"
            label="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
            <InputLabel
              htmlFor="outlined-adornment-password"
              onChange={(e) => setPassword(e.target.value)}
            >
              Password
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
          <Button type="submit">Submit</Button>
        </Stack>
      </Box>
    </div>
  );
};

export default Login;
