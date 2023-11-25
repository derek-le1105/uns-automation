import { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import SideNavbar from "../components/SideNavbar";

import { Box } from "@mui/material";

const Home = (props) => {
  const { link } = props;
  const [fileUpload, setFileUpload] = useState(null);
  const uploadFile = () => {
    if (fileUpload == null) return;

    const fileRef = ref(storage, `files/${fileUpload.name + v4()}`);

    uploadBytes(fileRef, fileUpload).then(
      () => {
        alert("File uploaded");
      },
      (error) => {
        alert(error);
      }
    );
  };
  return (
    <div className="">
      {/*<input
          onChange={(e) => {
            setFileUpload(e.target.files[0]);
          }}
        type="file"
        ></input>
      <button onClick={uploadFile}>Upload</button>*/}
      <Box sx={{ display: "flex" }}>
        <SideNavbar />
        {link}
      </Box>
    </div>
  );
};

export default Home;
