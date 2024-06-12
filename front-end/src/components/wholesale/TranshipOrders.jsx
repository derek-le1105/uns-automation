import { Grid, Box, Button } from "@mui/material";

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

  const handleGenerateClick = async (e) => {
    try {
      await fetch("/tsOrders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          return res.json();
        })
        .then(async (res_data) => {
          console.log(res_data);
        });
    } catch (error) {}
  };

  return (
    <Grid container>
      <Grid container item sx={{ margin: "50px" }}>
        <Grid xs item />
        <Grid xs={1} item>
          <Button variant="contained" onClick={getProducts}>
            Get Products
          </Button>
        </Grid>
        <Grid xs={1} item>
          <Button
            variant={apcUploaded && wcaUploaded ? "contained" : "disabled"}
            onClick={handleGenerateClick}
          >
            Generate Shopify Import
          </Button>
        </Grid>
      </Grid>
      <Grid container item>
        <FileUpload
          fileHandler={handleAPCFileUpload}
          componentString={"APC File"}
        />
      </Grid>
      <Grid container item>
        <FileUpload
          fileHandler={handleWCAFileUpload}
          componentString={"WCA File"}
        />
      </Grid>
    </Grid>
  );
};

export default TransshipOrders;
