import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ToggleButtonGroup,
  Box,
} from "@mui/material";

import { useState, useEffect } from "react";

import {
  readRetailExcel,
  createFormattedExcel,
} from "../../helper/readRetailExcel";

const ShipStationModal = ({ file, openModal, modalClose }) => {
  //detect plant packs with column B === 'zstem'
  const [packSelection, setPackSelection] = useState("Anubias Plant Pack");
  const [plantPacks, setPlantPacks] = useState([]);
  const [excelData, setExcelData] = useState([]);
  useEffect(() => {
    if (file) {
      async function importData() {
        let [data, packs] = await readRetailExcel(file);
        setExcelData(...data);
        setPlantPacks(...packs);
      }
      importData();
    }
  }, [file]);

  const handleClose = () => {
    modalClose();
  };
  const handleAgree = async () => {
    await createFormattedExcel(excelData, plantPacks);
    modalClose();
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
                sx={{ height: "100%" }}
              >
                {/* {plantPacks.forEach((pack) => {
                  let name = Object.keys(pack);
                  return (
                    <ToggleButton
                      value={name}
                      key={name}
                      sx={{
                        "&.MuiToggleButtonGroup-grouped": {
                          borderWidth: `1px ${
                            name !== packSelection ? "1px" : "0px"
                          } 1px 0px`,
                          borderColor: "black",
                          color: "black",
                          borderRadius: "0px",
                        },
                        "&:last-of-type": {
                          borderWidth: `1px ${
                            name !== packSelection ? "1px" : "0px"
                          } 0px 0px`,
                        },
                        "&:first-of-type": {
                          borderWidth: `0px ${
                            name !== packSelection ? "1px" : "0px"
                          } 1px 0px`,
                        },
                      }}
                    >
                      {name}
                    </ToggleButton>
                  );
                })} */}
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={8}>
              <Box>
                {/* {Object.entries(plantPacks).map(([name, list]) => {
                  return (
                    packSelection === name && (
                      <List sx={{ maxHeight: "100%", padding: "0px" }}>
                        {list.map((plant, idx) => {
                          return (
                            <ListItem sx={{ padding: "auto" }}>
                              <TextField
                                id={plant}
                                fullWidth
                                variant="standard"
                                defaultValue={plant}
                                sx={{ color: "black" }}
                                onChange={(e) => {
                                  let new_list = plantPacks[name];
                                  new_list[idx] = e.target.value;
                                  setPlantPacks({
                                    ...plantPacks,
                                    [name]: new_list,
                                  });
                                }}
                              >
                                {" "}
                              </TextField>
                            </ListItem>
                          );
                        })}
                      </List>
                    )
                  );
                })} */}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
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
