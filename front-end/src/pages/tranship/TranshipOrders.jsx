import { Grid, Button } from "@mui/material";

import { useState, useRef } from "react";
import { useSnackbar } from "notistack";

import FileUpload from "../../components/FileUpload";
import UpdatedProductsModal from "../../components/tranship/UpdatedProductsModal";

import { readFileUpload } from "../../helper/readTSFiles";

const TransshipOrders = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [apcUploaded, setAPCUploaded] = useState(false);
  const [wcaUploaded, setWCAUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateConfirmation, setUpdateConfirmation] = useState(false);

  const apcRef = useRef([]);
  const wcaRef = useRef([]);

  const handleAPCFileUpload = async (file) => {
    try {
      setAPCUploaded(true);
      await readFileUpload(file, "apc").then((data) => {
        apcRef.current = data;
      });
    } catch (error) {
      console.log(error.lineNumber);
    }
  };

  const handleWCAFileUpload = async (file) => {
    try {
      setWCAUploaded(true);
      await readFileUpload(file, "wca").then((data) => {
        wcaRef.current = data;
      });
    } catch (error) {
      console.log(error.lineNumber);
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
      await fetch("/apc/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apcRef.current),
      }).then((res) =>
        res.json().then((data) => enqueueSnackbar(data, { variant: "success" }))
      );

      await fetch("/apc/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apcRef.current),
      }).then((res) =>
        res.json().then((data) => enqueueSnackbar(data, { variant: "success" }))
      );

      closeSnackbar(updateSnackbarID);
    } catch (error) {
      enqueueSnackbar(`${error}`, { variant: "error" });
    }
    setLoading(false);
  };
  /*const handleWCAShopifyUpdate = async (e) => {
    try {
      const productSnackbarID = enqueueSnackbar(
        `Updating Shopify Products...`,
        {
          variant: "info",
          autoHideDuration: 10000,
        }
      );
      setLoading(true);
      await fetch("/wca/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wcaRef.current),
      }).then((res) => {
        res
          .json()
          .then((data) => enqueueSnackbar(data, { variant: "success" }));
      });
      closeSnackbar(updateSnackbarID);
      const variantSnackbarID = enqueueSnackbar(
        "Updating product variants...",
        {
          variant: "info",
          autoHideDuration: 10000,
        }
      );

      await fetch("/wca/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wcaRef.current),
      }).then((res) => {
        res
          .json()
          .then((data) => enqueueSnackbar(data, { variant: "success" }));
      });
      closeSnackbar(variantSnackbarID);
    } catch (error) {
      enqueueSnackbar(`${error}`, { variant: "error" });
    }
    setLoading(false);
  };*/

  const handleWCAShopifyUpdate = async () => {
    try {
      const updateSnackbarID = enqueueSnackbar(
        `Generating products to update...`,
        {
          variant: "info",
          autoHideDuration: 6000,
        }
      );
      const data = await fetch("/wca/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wcaRef.current),
      })
        .then((res) => {
          return res.json();
        })
        .then((temp) => {
          return temp;
        });
      closeSnackbar(updateSnackbarID);
      setUpdateConfirmation(true);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
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
      <UpdatedProductsModal openModal={updateConfirmation} />
    </>
  );
};

export default TransshipOrders;
