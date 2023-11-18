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
} from "@mui/material/";
import StorefrontIcon from "@mui/icons-material/Storefront";
import HistoryIcon from "@mui/icons-material/History";
import WarehouseIcon from "@mui/icons-material/Warehouse";
const drawerWidth = 180;

const Navbar = () => {
  return (
    <Box sx={{ display: "flex" }}>
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
            <ListItem key={text} disablePadding>
              <NavLink
                to={`/${text.toLowerCase()}`}
                style={{ textDecoration: "none", color: "black" }}
              >
                <ListItemButton>
                  <ListItemIcon>
                    {index === 0 ? (
                      <StorefrontIcon />
                    ) : index === 1 ? (
                      <WarehouseIcon />
                    ) : (
                      <HistoryIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </NavLink>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>
    </Box>
  );
};

export default Navbar;
