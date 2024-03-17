import {
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";

import PlantPackList from "./PlantPackList";

import { useState } from "react";

const ShipStationModal = ({ openModal, modalClose }) => {
  const anubiasList = [
    "Anubias Congensis (AAP)",
    "Anubias Congensis mini (AAP)",
    "Anubias Minima (AAP)",
    "Anubias Nana (AAP)",
    "Anubias Nana Petite (AAP)",
  ];

  const beginnerList = [
    "Anubias Nana - Pot (BPP)",
    "Anubias Nana Petite - Pot  (BPP)",
    "Crypt Beckettii  (BPP)",
    "Java Fern Pot (BPP)",
    "Java Fern Windelov (BPP)",
  ];

  const redStemList = [
    "Limnophila Aromatica (RSP)",
    "Ludwigia Diamond (RSP)",
    "Ludwigia Ovalis   (RSP)",
    "Ludwigia Super Red   (RSP)",
    "Rotala Blood Red  (RSP)",
  ];

  const plantedBuceList = [
    "Arrogant Blue (PBP)",
    "Black Pearl (PBP)",
    "Brownie Jade (PBP)",
    "Lamandau Mini Purple (PBP)",
    "Velvet 3 color (PBP)",
  ];
  const handleClose = () => {
    modalClose;
  };
  return (
    <>
      <Dialog open={openModal} onClose={handleClose} sx={{ padding: "50px" }}>
        <DialogTitle>Input plants for plant packs</DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs>
              <PlantPackList
                plantList={anubiasList}
                listName={"Anubias Plant Pack"}
              />
            </Grid>
            <Grid item xs>
              <PlantPackList
                plantList={beginnerList}
                listName={"Beginner Plant Pack"}
              />
            </Grid>
            <Grid item xs>
              <PlantPackList
                plantList={redStemList}
                listName={"Red Stem Pack"}
              />
            </Grid>
            <Grid item xs>
              <PlantPackList
                plantList={plantedBuceList}
                listName={"Planted Buce Pack"}
              />
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
