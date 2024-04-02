import { Box, Button } from "@mui/material";

import FileUpload from "../FileUpload";
import { useState } from "react";

const TransshipOrders = () => {
  const [apcUploaded, setAPCUploaded] = useState(false);
  const [wcaUploaded, setWCAUploaded] = useState(false);
  const getProducts = async () => {
    await fetch("/tsOrders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(),
    })
      .then((res) => {
        return res.json();
      })
      .then(async (res_data) => {
        console.log(res_data);
      });
  };

  const handleAPCFileUpload = (file) => {
    console.log(file);
    setAPCUploaded(true);
  };

  const handleWCAFileUpload = (file) => {
    console.log(file);
    setWCAUploaded(true);
  };

  return (
    <Box>
      <Button variant="contained" onClick={getProducts}>
        Get Products
      </Button>
      <FileUpload
        fileHandler={handleAPCFileUpload}
        componentString={"APC File"}
      />
      <FileUpload
        fileHandler={handleWCAFileUpload}
        componentString={"WCA File"}
      />
      <Button variant="contained">Generate Shopify Import</Button>
    </Box>
  );
};

export default TransshipOrders;
