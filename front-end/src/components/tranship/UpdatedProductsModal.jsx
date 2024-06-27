import { useState, useEffect } from "react";
import {
  Grid,
  Switch,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  FormControlLabel,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import { useSnackbar } from "notistack";

import DeleteIcon from "@mui/icons-material/Delete";

const UpdatedProductsModal = ({
  vendor,
  openModal,
  products,
  variants,
  onClose,
  onConfirmation,
}) => {
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [updatedVariants, setUpdatedVariants] = useState([]);
  const [showVariants, setShowVariants] = useState(false);
  const [deleteStack, setDeleteStack] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setData();
  }, [products]);

  const setData = () => {
    if (products) {
      let productMap = new Map();
      products.forEach((product) => {
        let { id, title, vendor, status } = product;
        if (productMap.has(title)) {
          let items = productMap.get(title); //{vendors: [], status: ...}
          items.vendors.push(vendor);
          productMap.set(title, items);
        } else {
          productMap.set(title, { id: id, vendors: [vendor], status: status });
        }
      });
      setUpdatedProducts(productMap);
    }
    if (variants) {
      setUpdatedVariants(variants);
    }
  };

  const handleSwitchChange = () => {
    setShowVariants(!showVariants);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDelete = (id) => {
    if (showVariants) {
      let deletedVariant = [
        "variant",
        updatedVariants[
          updatedVariants.findIndex((variant) => variant.id === id)
        ],
      ];
      setDeleteStack([...deleteStack, deletedVariant]);
      setUpdatedVariants(
        updatedVariants.filter((variant) => variant.id !== id)
      );
    } else {
      const newProducts = new Map(updatedProducts);
      for (let [key, value] of newProducts.entries()) {
        if (value.id === id) {
          let deletedProduct = ["product", { key: key, value: value }];
          setDeleteStack([...deleteStack, deletedProduct]);
          newProducts.delete(key);
          break;
        }
      }
      setUpdatedProducts(newProducts);
    }
  };

  const handleUndo = () => {
    if (deleteStack.length > 0) {
      let recent = deleteStack[deleteStack.length - 1];
      console.log(recent);
      if (recent[0] === "variant") {
        setUpdatedVariants([...updatedVariants, recent[1]]);
      } else {
        const newMap = new Map(updatedProducts);
        let data = recent[1];
        newMap.set(data["key"], data["value"]);
        setUpdatedProducts(newMap);
      }
    } else enqueueSnackbar("Nothing to undo!", { variant: "info" });
  };

  const handleReset = () => {
    setData();
  };

  const handleConfirmation = () => {
    //TODO: reformat updatedProducts and updatedVariants

    //updatedProducts: Map() -> {id: ..., title: ..., status: ...}
    //updatedVariants: should be fine?
    onConfirmation([updatedProducts, updatedVariants]);
  };

  return (
    <>
      <Dialog open={openModal} fullWidth maxWidth={"lg"}>
        <DialogTitle>Changing product status'</DialogTitle>
        <DialogContent>
          <Stack
            direction={"row"}
            sx={{
              display: "flex",
            }}
            justifyContent="space-between"
          >
            <Typography
              sx={{
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              {`The following items will be ${
                showVariants
                  ? "allowed to oversell"
                  : "have their statuses changed"
              }`}
            </Typography>
            <Stack direction="row" spacing={4}>
              <Button onClick={handleReset} variant="outlined">
                Reset
              </Button>
              <Button onClick={handleUndo} variant="contained">
                Undo
              </Button>
              <FormControlLabel
                sx={{
                  alignContent: "center",
                  justifyContent: "center",
                }}
                control={<Switch onChange={handleSwitchChange} />}
                label={showVariants ? "Products" : "Variants"}
              ></FormControlLabel>
            </Stack>
          </Stack>
          {showVariants ? (
            <Grid container sx={{ mt: "20px" }}>
              <>
                <Grid item xs={5}>
                  <Typography fontWeight={"bold"}>Variant Name</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography fontWeight={"bold"}>Barcode</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography fontWeight={"bold"}>Vendor(s)</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography fontWeight={"bold"}>Status</Typography>
                </Grid>
                <Grid item xs />
              </>

              {updatedVariants.map((variant) => (
                <>
                  <Grid item xs={5} sx={{ alignContent: "center" }}>
                    {variant.title}
                  </Grid>
                  <Grid item xs={2} sx={{ alignContent: "center" }}>
                    {`${
                      variant.barcode === ""
                        ? "Empty, please fix!"
                        : variant.barcode
                    }`}
                  </Grid>
                  <Grid item xs={2} sx={{ alignContent: "center" }}>
                    {variant.vendor}
                  </Grid>
                  <Grid item xs={2} sx={{ alignContent: "center" }}>
                    {`${
                      variant.inventoryPolicy === "CONTINUE"
                        ? "DENY"
                        : "CONTINUE"
                    } -> ${variant.inventoryPolicy}`}
                  </Grid>
                  <Grid item xs>
                    <IconButton
                      onClick={() => {
                        handleDelete(variant.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </>
              ))}
            </Grid>
          ) : (
            <Grid container sx={{ mt: "20px" }}>
              <Grid item xs={5}>
                <Typography fontWeight={"bold"}>Plant Name</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography fontWeight={"bold"}>Vendor(s)</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography fontWeight={"bold"}>Status</Typography>
              </Grid>
              <Grid item xs />
              {[...updatedProducts.keys()].map((product) => {
                let productValue = updatedProducts.get(product);
                return (
                  <>
                    <Grid item xs={5} sx={{ alignContent: "center" }}>
                      {product}
                    </Grid>
                    <Grid item xs={4} sx={{ alignContent: "center" }}>
                      {productValue["vendors"].join(", ")}
                    </Grid>
                    <Grid item xs={2} sx={{ alignContent: "center" }}>
                      {`${
                        productValue["status"] === "ACTIVE" ? "DENY" : "ACTIVE "
                      } -> ${productValue["status"]}`}
                    </Grid>
                    <Grid item xs>
                      <IconButton
                        onClick={() => {
                          handleDelete(productValue["id"]);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </>
                );
              })}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>

          <Button variant="contained" autoFocus onClick={handleConfirmation}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdatedProductsModal;
