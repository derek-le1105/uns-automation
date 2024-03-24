import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";

import { useState } from "react";

const ShipStationModal = ({ file, openModal, modalClose }) => {
  //detect plant packs with column B === 'zstem'
  const [packSelection, setPackSelection] = useState("Anubias Plant Pack");
  const [plantPacks, setPlantPacks] = useState({
    "Anubias Plant Pack": [
      "Anubias Congensis (AAP)",
      "Anubias Congensis mini (AAP)",
      "Anubias Minima (AAP)",
      "Anubias Nana (AAP)",
      "Anubias Nana Petite (AAP)",
    ],
    "Beginner Plant Pack": [
      "Anubias Nana - Pot (BPP)",
      "Anubias Nana Petite - Pot  (BPP)",
      "Crypt Beckettii  (BPP)",
      "Java Fern Pot (BPP)",
      "Java Fern Windelov (BPP)",
    ],
    "Red Stem Pack": [
      "Limnophila Aromatica (RSP)",
      "Ludwigia Diamond (RSP)",
      "Ludwigia Ovalis   (RSP)",
      "Ludwigia Super Red   (RSP)",
      "Rotala Blood Red  (RSP)",
    ],
    "Planted Buce Pack": [
      "Arrogant Blue (PBP)",
      "Black Pearl (PBP)",
      "Brownie Jade (PBP)",
      "Lamandau Mini Purple (PBP)",
      "Velvet 3 color (PBP)",
    ],
    "Assorted Echinodorus Pack": [
      "Echinodorus Martii Major",
      "Echinodorus Ozelot Green",
      "Echinodorus Ozelot",
      "Echinodorus Cordifolius",
      "Echinodorus Rose",
    ],
    "Aquarium Moss Collector Pack": [
      "Christmas Moss",
      "Java Moss",
      "Flame Moss",
      "Peacock Moss",
      "Spikey Moss",
    ],
  });
  const handleClose = () => {
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
                {Object.keys(plantPacks).map((name) => {
                  return (
                    <ToggleButton
                      value={name}
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
                })}
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={8}>
              <Box>
                {Object.entries(plantPacks).map(([name, list]) => {
                  return (
                    packSelection === name && (
                      <List sx={{ maxHeight: "100%", padding: "0px" }}>
                        {list.map((plant, idx) => {
                          return (
                            <ListItem sx={{ padding: "auto" }}>
                              <TextField
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
                })}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={modalClose}>Disagree</Button>
          <Button onClick={modalClose} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShipStationModal;
