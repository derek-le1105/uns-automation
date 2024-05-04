import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  TextField,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useEffect, useRef } from "react";
import {
  readRetailExcel,
  createFormattedExcel,
} from "../../helper/readRetailExcel";

import { supabase } from "../../supabaseClient";

const HeaderItem = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: "black",
  width: "100%",
}));

const ShipStationModal = ({ file, openModal, handleModalClose }) => {
  const [packSelection, setPackSelection] = useState();
  const [detectedPacks, setDetectedPacks] = useState({});
  const excelRef = useRef(null);
  const supabaseRef = useRef(null);

  useEffect(() => {
    if (file) {
      async function importData() {
        let { data: plant_packs, error } = await supabase
          .from("plant_packs")
          .select("*");
        await readRetailExcel(file, plant_packs).then((data) => {
          let [excel_data, packs_found] = data;
          excelRef.current = excel_data;
          let _ = Object.keys(packs_found).length ? packs_found : null;
          setDetectedPacks(_);
          setPackSelection(Object.keys(packs_found)[0]);
        });
        supabaseRef.current = plant_packs;
      }
      importData();
    }
  }, [file]);

  const handleClose = () => {
    handleModalClose();
  };

  const handleAgree = async () => {
    const { error } = await supabase
      .from("plant_packs")
      .upsert(
        Object.keys(detectedPacks).map((pack) => {
          let _ = { "Plant Pack": pack };
          detectedPacks[pack].forEach((plant, idx) => {
            _[`item_${idx + 1}`] = plant;
          });
          return _;
        })
      )
      .select();
    await createFormattedExcel(excelRef.current, detectedPacks);

    handleModalClose();
  };
  const handleSelection = (e, newSelection) => {
    setPackSelection(newSelection);
  };
  return (
    <>
      <Dialog
        open={openModal}
        onClose={handleClose}
        sx={{ padding: "50px", minHeight: "5vh" }}
        maxWidth="md"
      >
        {detectedPacks ? (
          <>
            <DialogTitle>Input plants for plant packs</DialogTitle>

            <DialogContent>
              <Grid
                container
                sx={{ border: "1px solid black", borderRadius: "4px" }}
              >
                <Grid item container xs>
                  <Stack>
                    <HeaderItem>Pack</HeaderItem>
                    <ToggleButtonGroup
                      value={packSelection}
                      exclusive
                      onChange={handleSelection}
                      orientation="vertical"
                      sx={{ height: "100%" }}
                    >
                      {Object.keys(detectedPacks).map((pack) => {
                        return (
                          <ToggleButton value={pack} key={pack}>
                            {pack}
                          </ToggleButton>
                        );
                      })}
                    </ToggleButtonGroup>
                  </Stack>
                </Grid>
                <Grid item container xs>
                  <HeaderItem>Plant</HeaderItem>
                  <Stack flexWrap="wrap" sx={{ width: "100%" }}>
                    {Object.keys(detectedPacks).map((pack) => {
                      return (
                        packSelection === pack &&
                        detectedPacks[pack].map((plant, idx) => {
                          return (
                            <TextField
                              id={plant["plant"]}
                              fullWidth
                              variant="outlined"
                              defaultValue={plant["plant"]}
                              sx={{ color: "black", width: "100%" }}
                              onChange={(e) => {
                                let new_list = detectedPacks[pack];
                                new_list[idx]["plant"] = e.target.value;
                                setDetectedPacks({
                                  ...detectedPacks,
                                  [pack]: new_list,
                                });
                              }}
                            />
                          );
                        })
                      );
                    })}
                  </Stack>
                </Grid>
                <Grid item container xs>
                  <HeaderItem>Location</HeaderItem>
                  <Stack flexWrap="wrap" sx={{ width: "100%" }}>
                    {Object.keys(detectedPacks).map((pack) => {
                      return (
                        packSelection === pack &&
                        detectedPacks[pack].map((plant, idx) => {
                          return (
                            <TextField
                              id={plant["location"]}
                              fullWidth
                              variant="outlined"
                              defaultValue={plant["location"]}
                              sx={{ color: "black" }}
                              onChange={(e) => {
                                let new_list = detectedPacks[pack];
                                new_list[idx]["location"] = e.target.value;
                                setDetectedPacks({
                                  ...detectedPacks,
                                  [pack]: new_list,
                                });
                              }}
                            />
                          );
                        })
                      );
                    })}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        ) : (
          <>
            <DialogTitle>No packs detected!</DialogTitle>
            <DialogContent></DialogContent>
          </>
        )}
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleAgree} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShipStationModal;
