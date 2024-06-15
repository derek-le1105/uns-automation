import { Grid, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { useState, useRef } from "react";
import { useSnackbar } from "notistack";

import FileUpload from "../FileUpload";

import { readFileUpload } from "../../helper/readTSFiles";

const TransshipOrders = () => {
  const theme = useTheme();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [apcUploaded, setAPCUploaded] = useState(false);
  const [wcaUploaded, setWCAUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const apcRef = useRef([]);
  const wcaRef = useRef([]);

  const handleAPCFileUpload = async (file) => {
    try {
      setAPCUploaded(true);
      await readFileUpload(file, "apc").then((data) => {
        apcRef.current = data;
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleWCAFileUpload = async (file) => {
    try {
      setWCAUploaded(true);
      await readFileUpload(file, "wca").then((data) => {
        wcaRef.current = data;
      });
    } catch (error) {
      console.log(error);
    }
    console.log(file);
    setWCAUploaded(true);
  };

  const handleAPCShopifyUpdate = async (e) => {
    try {
      const updateSnackbarID = enqueueSnackbar(`Updating Shopify Products...`, {
        variant: "info",
        autoHideDuration: 6000,
      });
      setLoading(true);
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
          closeSnackbar(updateSnackbarID);
          enqueueSnackbar(`${res_data}`, { variant: "success" });
        });
    } catch (error) {
      enqueueSnackbar(`${error}`, { variant: "error" });
    }
    setLoading(false);
  };
  const handleWCAShopifyUpdate = async (e) => {
    try {
      const updateSnackbarID = enqueueSnackbar(`Updating Shopify Products...`, {
        variant: "info",
        autoHideDuration: 6000,
      });
      setLoading(true);
      await fetch("/wca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wcaRef.current),
      })
        .then((res) => {
          return res.json();
        })
        .then(async (res_data) => {
          //console.log(res_data);
          closeSnackbar(updateSnackbarID);
          enqueueSnackbar(`${res_data}`, { variant: "success" });
        });
    } catch (error) {
      enqueueSnackbar(`${error}`, { variant: "error" });
    }
    setLoading(false);
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
            disabled={!apcUploaded || loading}
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
          <Button
            variant="contained"
            disabled={!wcaUploaded || loading}
            onClick={handleWCAShopifyUpdate}
          >
            Update WCA
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TransshipOrders;
