import SideNavbar from "../components/SideNavbar";

import { Box } from "@mui/material";

const Home = (props) => {
  const { link } = props;
  return (
    <div className="">
      <Box sx={{ display: "flex" }}>
        <SideNavbar />
        {link}
      </Box>
    </div>
  );
};

export default Home;
