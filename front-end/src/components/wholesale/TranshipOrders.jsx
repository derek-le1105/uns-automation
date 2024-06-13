import { Grid, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { useState, useRef } from "react";
import { useSnackbar } from "notistack";

import FileUpload from "../FileUpload";

import { readAPCFileUpload } from "../../helper/readAPCFileUpload";

const TransshipOrders = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [apcUploaded, setAPCUploaded] = useState(false);
  const [wcaUploaded, setWCAUploaded] = useState(false);

  const apcRef = useRef([]);
  const wcaRef = useRef([]);

  const handleAPCFileUpload = async (file) => {
    try {
      setAPCUploaded(true);
      await readAPCFileUpload(file).then((data) => {
        apcRef.current = data;
      });
    } catch (error) {}
  };

  const handleWCAFileUpload = (file) => {
    console.log(file);
    setWCAUploaded(true);
  };

  const handleAPCShopifyUpdate = async (e) => {
    try {
      enqueueSnackbar(`Updating Shopify Products...`, {
        variant: "info",
        autoHideDuration: 6000,
      });
      await fetch("/apc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apcRef.current),
      })
        .then((res) => {
          return res.json();
        })
        .then(async (res_data) => {
          console.log(res_data);
          enqueueSnackbar(`${res_data}`, { variant: "success" });
        });
    } catch (error) {
      enqueueSnackbar(`${error}`, { variant: "error" });
    }
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
