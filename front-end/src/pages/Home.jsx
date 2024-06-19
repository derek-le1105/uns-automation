import SideNavbar from "../components/SideNavbar";

import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";

const Home = (props) => {
  const theme = useTheme();
  const { link } = props;
  return (
    <div className="">
      <Box sx={{ display: "flex", background: `${theme.palette.grey[100]}` }}>
        <SideNavbar />
        {link}
      </Box>
    </div>
  );
};

export default Home;
