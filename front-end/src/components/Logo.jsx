import { Box } from "@mui/material";
import { NavLink } from "react-router-dom";
const Logo = () => {
  const logoPath = "../../public/Ultum-Nature-Systems-Logo.svg";
  return (
    <>
      <NavLink to="/" sx={{ width: "100%" }}>
        <Box
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <img
            className={"uns-logo"}
            alt="UNS Logo"
            src={logoPath}
            draggable={false}
          />
        </Box>
      </NavLink>
    </>
  );
};

export default Logo;
