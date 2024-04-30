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
} from "@mui/material";

import { useState, useEffect, useRef } from "react";

import {
  readRetailExcel,
  createFormattedExcel,
} from "../../helper/readRetailExcel";

import { supabase } from "../../supabaseClient";

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
          excelRef.current = data[0];
          setDetectedPacks(data[1]);
          setPackSelection(Object.keys(data[1])[0]);
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
            _[`Plant ${idx + 1}`] = plant;
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
        fullWidth
        open={openModal}
        onClose={handleClose}
        sx={{ padding: "50px", minHeight: "5vh" }}
        maxWidth="sm"
      >
        <DialogTitle>Input plants for plant packs</DialogTitle>
        {detectedPacks && (
          <DialogContent>
            <Grid
              container
              sx={{ border: "1px solid black", borderRadius: "4px" }}
            >
              <Grid item xs>
                <ToggleButtonGroup
                  value={packSelection}
                  exclusive
                  onChange={handleSelection}
                  orientation="vertical"
                >
                  {Object.keys(detectedPacks).map((pack) => {
                    return (
                      <ToggleButton value={pack} key={pack}>
                        {pack}
                      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={8}>
                <Stack useFlexGap flexWrap="wrap">
                  {Object.keys(detectedPacks).map((pack) => {
                    return (
                      packSelection === pack &&
                      detectedPacks[pack].map((plant, idx) => {
                        return (
                          <TextField
                            id={plant}
                            fullWidth
                            variant="outlined"
                            defaultValue={plant}
                            sx={{ color: "black" }}
                            onChange={(e) => {
                              let new_list = detectedPacks[pack];
                              new_list[idx] = e.target.value;
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
