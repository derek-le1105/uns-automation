import { Grid, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { useState } from "react";

import FileUpload from "../FileUpload";

import { readAPCFileUpload } from "../../helper/readAPCFileUpload";

const TransshipOrders = () => {
  const theme = useTheme();
  const [apcUploaded, setAPCUploaded] = useState(false);
  const [wcaUploaded, setWCAUploaded] = useState(false);

  const handleAPCFileUpload = async (file) => {
    try {
      setAPCUploaded(true);
      await readAPCFileUpload(file).then((data) => {
        console.log(data);
      });
    } catch (error) {}
  };

  const handleWCAFileUpload = (file) => {
    console.log(file);
    setWCAUploaded(true);
  };

  const handleAPCShopifyUpdate = async (e) => {
    try {
      await fetch("/apc", {
        method: "GET",
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
      <Grid container item sx={{ margin: "50px" }} />
      <Grid container item>
        <FileUpload
          fileHandler={handleAPCFileUpload}
          componentString={"APC File"}
        />
        <Grid item xs={5}>
          <Button
            variant="contained"
            disabled={!apcUploaded}
            onClick={handleAPCShopifyUpdate}
          >
            Update APC
          </Button>
        </Grid>
      </Grid>
      <Grid container item>
        <FileUpload
          fileHandler={handleWCAFileUpload}
          componentString={"WCA File"}
        />
        <Grid item>
          <Button variant="contained" disabled={!wcaUploaded}>
            Update WCA
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TransshipOrders;
