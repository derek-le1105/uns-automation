import { NavLink } from "react-router-dom";
import {
  Box,
  Drawer,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material/";
import { useTheme } from "@mui/material/styles";
import StorefrontIcon from "@mui/icons-material/Storefront";
import HistoryIcon from "@mui/icons-material/History";
import WarehouseIcon from "@mui/icons-material/Warehouse";

import { supabase } from "../supabaseClient";
const drawerWidth = 180;

const Navbar = () => {
  const theme = useTheme();
  const getIcon = (text) => {
    switch (text) {
      case "Wholesale":
        return <StorefrontIcon />;
      case "Warehouse":
        return <WarehouseIcon />;
      case "History":
        return <HistoryIcon />;
      default:
        return;
    }
  };

  const handleSignout = async (e) => {
    await supabase.auth.signOut();
  };

  return (
    <Box sx={{ display: "flex", background: `${theme.palette.primary.main}` }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          {["Wholesale", "Warehouse", "History"].map((text, index) => (
            <NavLink
              to={`/${text.toLowerCase()}`}
              style={{ textDecoration: "none", color: "black" }}
              key={text}
            >
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>{getIcon(text)}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            </NavLink>
          ))}
        </List>
        <Divider />
        <Button onClick={handleSignout}>Signout</Button>
      </Drawer>
    </Box>
  );
};

export default Navbar;
