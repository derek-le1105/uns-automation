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

import { supabase } from "../../supabaseClient";
import { useEffect, useState } from "react";
import { format_data } from "../../helper/supabaseHelpers";
import { useSnackbar } from "notistack";

const BulkEditDialog = ({ title, handleModalClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [supabasePacks, setSupabasePacks] = useState();
  const [selectedPack, setSelectedPack] = useState();
  const [edittedPacks, setEdittedPacks] = useState();

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

  useEffect(() => {
    async function fetchSupabase() {
      let { data: plant_packs } = await supabase
        .from("plant_packs")
        .select("*");
      let formatted_packs = format_data(plant_packs);
      setSupabasePacks(formatted_packs);
      setSelectedPack(Object.keys(formatted_packs).sort()[0]);
    }
    fetchSupabase();
  }, []);

  const handleAgree = async () => {
    if (!edittedPacks) {
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

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      {supabasePacks && (
        <DialogContent>
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

          {selectedPack && (
            <Grid item container spacing={3}>
              <Grid item xs>
                <Stack spacing={3} sx={{ marginTop: "20px" }}>
                  {supabasePacks[selectedPack].map((item, idx) => {
                    return (
                      <TextField
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
        </DialogContent>
      )}
      <DialogActions sx={{ padding: "0px 25px 25px 25px" }}>
        <Button onClick={handleModalClose} variant="outlined" autoFocus>
          Close
        </Button>
        <Button onClick={handleAgree} variant="contained" autoFocus>
          Update
        </Button>
      </DialogActions>
    </>
  );
};

export default BulkEditDialog;
