import SideNavbar from "./SideNavbar";

import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";

const DefaultLayout = ({ children }) => {
  const path = useLocation().pathname;
  const theme = useTheme();
  return (
    <div className="">
      <Box sx={{ display: "flex", background: `${theme.palette.grey[100]}` }}>
        <SideNavbar location={path} />
        {children}
      </Box>
    </div>
  );
};

export default DefaultLayout;
