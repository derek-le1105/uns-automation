import { Grid, Button } from "@mui/material";

import { useState, useRef } from "react";
import { useSnackbar } from "notistack";

import FileUpload from "../../components/FileUpload";
import UpdatedProductsModal from "../../components/tranship/UpdatedProductsModal";
import createTranshipDraft from "../../helper/createTranshipDraft";

import { readFileUpload } from "../../helper/readTSFiles";

import { supabase } from "../../supabaseClient";

const TransshipOrders = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [apcUploaded, setAPCUploaded] = useState(false);
  const [wcaUploaded, setWCAUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateConfirmation, setUpdateConfirmation] = useState(false);
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [vendorUpdating, setVendorUpdating] = useState("");

  const apcRef = useRef([]);
  const wcaRef = useRef([]);

  const handleAPCFileUpload = async (file) => {
    try {
      await readFileUpload(file, "apc")
        .then((data) => {
          apcRef.current = data;
          setAPCUploaded(true);
        })
        .catch((err) => enqueueSnackbar(err, { variant: "error" }));
    } catch (error) {
      console.log(error.lineNumber);
    }
  };

  const handleWCAFileUpload = async (file) => {
    try {
      await readFileUpload(file, "wca")
        .then((data) => {
          wcaRef.current = data;
          setWCAUploaded(true);
        })
        .catch((err) => enqueueSnackbar(err, { variant: "error" }));
    } catch (error) {
      console.log(error.lineNumber);
    }
  };

  const handleAPCShopifyUpdate = async (e) => {
    try {
      const updateSnackbarID = enqueueSnackbar(
        `Generating products to update...`,
        {
          variant: "info",
          autoHideDuration: 10000,
        }
      );
      setLoading(true);
      const data = await fetch("/apc/statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apcRef.current),
      })
        .then((res) => {
          return res.json();
        })
        .then((temp) => {
          return temp;
        });
      closeSnackbar(updateSnackbarID);
      setUpdateConfirmation(true);
      setUpdatedProducts(data);
      setVendorUpdating("apc");

      closeSnackbar(updateSnackbarID);
    } catch (error) {
      enqueueSnackbar(`${error}`, { variant: "error" });
    }
    setLoading(false);
  };

  const handleWCAShopifyUpdate = async () => {
    try {
      const updateSnackbarID = enqueueSnackbar(
        `Generating products to update...`,
        {
          variant: "info",
          autoHideDuration: 10000,
        }
      );
      const data = await fetch("/wca/statuses", {
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
      setUpdatedProducts(data);
      setVendorUpdating("wca");
    } catch (error) {
      console.log(error);
    }
  };

  const finalizeUpdating = async (data) => {
    setUpdateConfirmation(false);
    try {
      setLoading(true);

      const updateSnackbarID = enqueueSnackbar(`Updating Shopify Products...`, {
        variant: "info",
        autoHideDuration: 6000,
      });

      const [products, variants] = data;
      await fetch(`/${vendorUpdating}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(products),
      }).then((res) =>
        res.json().then((data) => enqueueSnackbar(data, { variant: "success" }))
      );

      closeSnackbar(updateSnackbarID);
      const variantSnackbarID = enqueueSnackbar(
        "Updating product variants...",
        {
          variant: "info",
          autoHideDuration: 10000,
        }
      );

      await fetch(`/${vendorUpdating}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variants),
      }).then((res) =>
        res.json().then((data) => enqueueSnackbar(data, { variant: "success" }))
      );
      closeSnackbar(variantSnackbarID);

      await createTranshipDraft(data);
    } catch (error) {
      enqueueSnackbar(`${error}`, { variant: "error" });
    }

    setLoading(false);
  };

  const handleModalClose = () => {
    setUpdateConfirmation(false);
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
      <UpdatedProductsModal
        openModal={updateConfirmation}
        products={updatedProducts[0]}
        variants={updatedProducts[1]}
        onClose={handleModalClose}
        onConfirmation={finalizeUpdating}
      />
    </>
  );
};

export default TransshipOrders;
