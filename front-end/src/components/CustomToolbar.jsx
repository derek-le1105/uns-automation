import { AppBar, Toolbar, Typography } from "@mui/material";

const CustomToolbar = (props) => {
  const { drawerWidth, getShopify, generateExcel } = props;
  return (
    <AppBar
      position="fixed"
      sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Permanent drawer
        </Typography>
        <button onClick={getShopify}>Shopify</button>
        <button onClick={generateExcel}>Excel Files</button>
      </Toolbar>
    </AppBar>
  );
};

export default CustomToolbar;
