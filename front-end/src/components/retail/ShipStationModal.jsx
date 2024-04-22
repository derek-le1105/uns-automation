import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  List,
  ListItem,
  TextField,
} from "@mui/material";

import { useState, useEffect } from "react";

import {
  readRetailExcel,
  createFormattedExcel,
} from "../../helper/readRetailExcel";

const ShipStationModal = ({ file, openModal, modalClose }) => {
  const [packSelection, setPackSelection] = useState(
    "Assorted Anubias Plant Pack"
  );
  const [plantPacks, setPlantPacks] = useState({});
  const [excelData, setExcelData] = useState([]);
  useEffect(() => {
    if (file) {
      async function importData() {
        await readRetailExcel(file).then((data) => {
          setExcelData(data[0]);
          setPlantPacks(data[1]);
        });
      }
      importData();
    }
  }, [file]);

  const handleClose = () => {
    modalClose();
  };

  const handleAgree = async () => {
    await createFormattedExcel(excelData);
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
        {plantPacks && (
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
                  {Object.keys(plantPacks).map((pack) => {
                    return (
                      <ToggleButton
                        value={pack}
                        key={pack}
                        sx={{
                          "&.MuiToggleButtonGroup-grouped": {
                            borderWidth: `1px ${
                              pack !== packSelection ? "1px" : "0px"
                            } 1px 0px`,
                            borderColor: "black",
                            color: "black",
                            borderRadius: "0px",
                          },
                          "&:last-of-type": {
                            borderWidth: `1px ${
                              pack !== packSelection ? "1px" : "0px"
                            } 0px 0px`,
                          },
                          "&:first-of-type": {
                            borderWidth: `0px ${
                              pack !== packSelection ? "1px" : "0px"
                            } 1px 0px`,
                          },
                        }}
                      >
                        {pack}
                      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={8}>
                <Box>
                  {Object.keys(plantPacks).map((pack) => {
                    return (
                      packSelection === pack && (
                        <>
                          <List sx={{ maxHeight: "100%", padding: "0px" }}>
                            {plantPacks[pack].map((plant, idx) => {
                              return (
                                <ListItem sx={{ padding: "auto" }} key={plant}>
                                  <TextField
                                    id={plant}
                                    fullWidth
                                    variant="standard"
                                    defaultValue={plant}
                                    sx={{ color: "black" }}
                                    onChange={(e) => {
                                      let new_list = plantPacks[pack];
                                      new_list[idx] = e.target.value;
                                      setPlantPacks({
                                        ...plantPacks,
                                        [pack]: new_list,
                                      });
                                    }}
                                  >
                                    {" "}
                                  </TextField>
                                </ListItem>
                              );
                            })}
                          </List>
                        </>
                      )
                    );
                  })}
                </Box>
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
