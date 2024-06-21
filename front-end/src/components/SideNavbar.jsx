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
import { styled, useTheme, alpha } from "@mui/material/styles";
import StorefrontIcon from "@mui/icons-material/Storefront";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import WarehouseIcon from "@mui/icons-material/Warehouse";

import Logo from "./Logo";

import { supabase } from "../supabaseClient";
const drawerWidth = 180;
const logo = "../../public/Ultum-Nature-Systems-Logo.png";

const SideNavbar = ({ location }) => {
  const theme = useTheme();

  const getIcon = (text) => {
    switch (text) {
      case "Wholesale":
        return <StorefrontIcon />;
      case "Retail":
        return <WarehouseIcon />;
      case "Tranship":
        return <FlightLandIcon />;
      default:
        return;
    }
  };

  const handleSignout = async (e) => {
    await supabase.auth.signOut();
  };

  const NavItem = ({ path, text }) => {
    const active = path === `/${text.toLowerCase()}`;
    return (
      <>
        <ListItem key={text} disablePadding>
          {
            <ListItemButton
              sx={{
                ...(active && {
                  color: "primary.main",
                  fontWeight: "fontWeightSemiBold",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                  },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  ...(active && {
                    color: "primary.main",
                  }),
                }}
              >
                {getIcon(text)}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          }
          <div></div>
        </ListItem>
      </>
    );
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
        <Logo />
        <Divider />
        <List>
          {["Retail", "Wholesale", "Tranship"].map((text, index) => (
            <NavLink
              to={`/${text.toLowerCase()}`}
              style={{ textDecoration: "none", color: "black" }}
              key={text}
            >
              <NavItem path={location} text={text} />
            </NavLink>
          ))}
        </List>
        <Divider />
        <Button onClick={handleSignout}>Signout</Button>
      </Drawer>
    </Box>
  );
};

export default SideNavbar;
