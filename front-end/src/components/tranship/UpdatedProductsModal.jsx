import { useState } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
} from "@mui/material";

const UpdatedProductsModal = ({ openModal, products }) => {
  return (
    <>
      <Dialog open={openModal}>
        <DialogTitle></DialogTitle>
        <DialogContent></DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </>
  );
};

export default UpdatedProductsModal;
