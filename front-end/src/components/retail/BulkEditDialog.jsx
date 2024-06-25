import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Autocomplete,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

import { supabase } from "../../supabaseClient";
import { useEffect, useState, useContext } from "react";
import { format_data } from "../../helper/supabaseHelpers";
import { useSnackbar } from "notistack";
import { SupabaseContext } from "../Contexts";

import DeleteConfirmation from "./DeleteConfirmation";

const BulkEditDialog = ({ title, handleModalClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [supabasePacks, setSupabasePacks] = useState();
  const [selectedPack, setSelectedPack] = useState();
  const [edittedPacks, setEdittedPacks] = useState();
  const [addPack, setAddPack] = useState(false);
  const [newName, setNewName] = useState("");
  const [newProducts, setNewProducts] = useState(["", "", "", "", ""]);
  const [newLocations, setNewLocations] = useState(["", "", "", "", ""]);
  const [deleteClicked, setDeleteClicked] = useState(false);

  const supabase_packs = useContext(SupabaseContext);

  function areAllEntriesEmpty(arr) {
    let isEmpty = true;
    arr.forEach((item) => {
      if (item !== "") isEmpty = false;
    });
    return isEmpty;
  }

  const isEditsValid = () => {
    if (edittedPacks) {
      for (let pack in edittedPacks) {
        for (let item of edittedPacks[pack]) {
          let plant = item.plant !== "",
            location = item.location !== "";
          if ((plant && !location) || (!plant && location)) {
            let snackbar_string =
              plant && !location
                ? "Items must have a location"
                : "A location is missing an item";
            setSelectedPack(pack);
            enqueueSnackbar(snackbar_string, { variant: "error" });
            console.log("asdf");
            return false;
          }
        }
      }
    }
    return true;
  };

  const isNewPackValid = () => {
    function isValidProduct(product, location) {
      if (product === "" && location !== "") return false;
      else if (product !== "" && location === "") return false;
      else return true;
    }

    if (newName === "") return false;
    if (areAllEntriesEmpty(newProducts)) return false;
    if (areAllEntriesEmpty(newLocations)) return false;

    for (let i = 0; i < newProducts.length; i += 1) {
      let product = newProducts[i],
        location = newLocations[i];
      if (!isValidProduct(product, location)) return false;
    }
    return true;
  };

  useEffect(() => {
    async function fetchSupabase() {
      let formatted_packs = format_data(supabase_packs);
      setSupabasePacks(formatted_packs);
      setSelectedPack(Object.keys(formatted_packs).sort()[0]);
    }
    fetchSupabase();
  }, []);

  const handleAgree = async () => {
    if (!edittedPacks) {
      enqueueSnackbar(`Nothing was updated`, { variant: "info" });
      handleModalClose();
      return;
    }

    if (isEditsValid()) {
      const { error: plant_error } = await supabase
        .from("plant_packs")
        .upsert(
          Object.keys(supabasePacks).map((pack) => {
            let _ = { "Plant Pack": pack };
            supabasePacks[pack].forEach((plant, idx) => {
              _[`item_${idx + 1}`] = plant;
            });
            return _;
          })
        )
        .select();
      if (!plant_error)
        enqueueSnackbar(`Successfully updated`, { variant: "success" });
      else enqueueSnackbar(`Error updating`, { variant: "error" });
      handleModalClose();
    }
  };

  const handleAddPackClicked = () => {
    setAddPack(!addPack);
    if (addPack) handleClear();
  };

  const handleClear = () => {
    if (
      areAllEntriesEmpty(newProducts) &&
      areAllEntriesEmpty(newLocations) &&
      newName === ""
    ) {
      handleModalClose();
    } else {
      setNewName("");
      setNewProducts(["", "", "", "", ""]);
      setNewLocations(["", "", "", "", ""]);
    }
  };

  const handleAddNewPack = async () => {
    if (!isNewPackValid())
      enqueueSnackbar("Adding new pack is not valid", { variant: "error" });
    else {
      let newRow = {};
      newRow["Plant Pack"] = newName;
      newProducts.forEach((product, idx) => {
        let item = { plant: product, location: newLocations[idx] };
        newRow[`item_${idx + 1}`] = item;
      });
      const { error } = await supabase.from("plant_packs").insert([newRow]);

      if (error !== null) {
        if (error.code === "23505")
          enqueueSnackbar("A pack with this name exists already", {
            variant: "error",
          });
      } else enqueueSnackbar("Successfully added pack", { variant: "Success" });
    }
  };

  const handleDeleteExistingPack = () => {
    setDeleteClicked(true);
  };

  const handleCloseConfirmation = () => {
    setDeleteClicked(false);
  };

  const handleDeleting = async () => {
    console.log(selectedPack);
    const { error } = await supabase
      .from("plant_packs")
      .delete()
      .eq("Plant Pack", selectedPack);
    if (error === null)
      enqueueSnackbar(`Successfully deleted ${selectedPack}`, {
        variant: "success",
      });
    else console.log(error);
  };

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {supabasePacks && (
          <>
            <Grid container>
              <Grid item xs="auto">
                {!addPack ? (
                  <Autocomplete
                    options={Object.keys(supabasePacks).sort()}
                    renderInput={(params) => (
                      <TextField {...params} label="Product Packs" />
                    )}
                    sx={{ width: "375px", padding: "5px 0px" }}
                    onChange={(e, value) => {
                      setSelectedPack(value);
                    }}
                    value={selectedPack}
                  ></Autocomplete>
                ) : (
                  <TextField
                    value={newName}
                    label="Product Name"
                    sx={{ width: "375px", padding: "5px 0px" }}
                    onChange={(e) => {
                      setNewName(e.target.value);
                    }}
                  />
                )}
              </Grid>
              {!addPack && (
                <Grid item xs="auto" sx={{ padding: "5px 0px", ml: "25px" }}>
                  <Button
                    sx={{ height: "100%" }}
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={handleDeleteExistingPack}
                  >
                    Delete
                  </Button>
                </Grid>
              )}

              <Grid item xs />

              <Grid item xs="auto" sx={{ padding: "5px 0px" }}>
                <Button
                  sx={{ height: "100%", padding: "0px 30px" }}
                  variant="contained"
                  onClick={handleAddPackClicked}
                >
                  {addPack ? `View packs` : `Add Pack`}
                </Button>
              </Grid>
            </Grid>

            {selectedPack && !addPack && (
              <Grid item container spacing={3}>
                <Grid item xs>
                  <Stack spacing={3} sx={{ marginTop: "20px" }}>
                    {supabasePacks[selectedPack].map((item, idx) => {
                      return (
                        <TextField
                          key={idx}
                          label={`Item ${idx + 1}`}
                          value={item["plant"]}
                          sx={{ width: "100%" }}
                          onChange={(e) => {
                            let temp_list = supabasePacks[selectedPack];
                            temp_list[idx]["plant"] = e.target.value;
                            setSupabasePacks({
                              ...supabasePacks,
                              [selectedPack]: temp_list,
                            });
                            setEdittedPacks({
                              ...edittedPacks,
                              [selectedPack]: temp_list,
                            });
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Grid>
                <Grid item xs>
                  <Stack spacing={3} sx={{ marginTop: "20px" }}>
                    {supabasePacks[selectedPack].map((item, idx) => {
                      return (
                        <TextField
                          key={idx}
                          label={`Location ${idx + 1}`}
                          value={item["location"]}
                          sx={{ width: "100%" }}
                          onChange={(e) => {
                            let temp_list = supabasePacks[selectedPack];
                            temp_list[idx]["location"] = e.target.value;
                            setSupabasePacks({
                              ...supabasePacks,
                              [selectedPack]: temp_list,
                            });
                            setEdittedPacks({
                              ...edittedPacks,
                              [selectedPack]: temp_list,
                            });
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Grid>
              </Grid>
            )}
          </>
        )}
        {addPack && (
          <>
            <Grid item container spacing={3}>
              <Grid item xs>
                <Stack spacing={3} sx={{ marginTop: "20px" }}>
                  {newProducts.map((item, idx) => {
                    return (
                      <TextField
                        key={idx}
                        label={`Item ${idx + 1}`}
                        value={item}
                        sx={{ width: "100%" }}
                        onChange={(e) => {
                          const newList = [...newProducts];
                          newList[idx] = e.target.value;
                          setNewProducts(newList);
                        }}
                      />
                    );
                  })}
                </Stack>
              </Grid>
              <Grid item xs>
                <Stack spacing={3} sx={{ marginTop: "20px" }}>
                  {newLocations.map((item, idx) => {
                    return (
                      <TextField
                        key={idx}
                        label={`Location ${idx + 1}`}
                        value={item}
                        sx={{ width: "100%" }}
                        onChange={(e) => {
                          const newList = [...newLocations];
                          newList[idx] = e.target.value;
                          setNewLocations(newList);
                        }}
                      />
                    );
                  })}
                </Stack>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ padding: "0px 25px 25px 25px" }}>
        {!addPack ? (
          <>
            <Button onClick={handleModalClose} variant="outlined" autoFocus>
              Close
            </Button>
            <Button onClick={handleAgree} variant="contained" autoFocus>
              Update
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClear} variant="outlined" autoFocus>
              Clear
            </Button>
            <Button onClick={handleAddNewPack} variant="contained" autoFocus>
              Add
            </Button>
          </>
        )}
      </DialogActions>

      <DeleteConfirmation
        deleteClicked={deleteClicked}
        onClose={handleCloseConfirmation}
        packTitle={selectedPack}
        onConfirmation={handleDeleting}
      />
    </>
  );
};

export default BulkEditDialog;
